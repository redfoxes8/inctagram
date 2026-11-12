import { readFileSync } from "node:fs"
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client"
import { buildSchema, validate } from "graphql"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createSuperadminTransport } from "@/shared/api/apollo/transport"
import { BAN_USER, banSuperadminUser } from "@/features/superadmin-users/api/ban-user-api"
import { getBanReason, type BanReasonInput } from "@/features/superadmin-users/model/ban-user.types"

// Synthetic fixtures only. Fetch is replaced; no Gateway or student is contacted.
const userId = "00000000-0000-4000-8000-00000000b001"
const fetchMock = vi.fn<typeof fetch>()
const clients: ApolloClient[] = []
function client() {
  const instance = new ApolloClient({
    devtools: { enabled: false },
    link: new HttpLink({ uri: "https://mock.invalid/api/v1/graphql", fetch: createSuperadminTransport() }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: { fetchPolicy: "no-cache", errorPolicy: "all" },
      watchQuery: { fetchPolicy: "no-cache", errorPolicy: "all" },
      mutate: { errorPolicy: "all" },
    },
  })
  clients.push(instance)
  return instance
}
function reply(outcome: string, id = userId, errors?: unknown[]) {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ data: { superadminBlockUser: { userId: id, outcome } }, errors }), {
      headers: { "Content-Type": "application/json" },
    }),
  )
}
beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal("window", {})
  vi.stubGlobal("fetch", fetchMock)
})
afterEach(() => {
  clients.splice(0).forEach((item) => item.stop())
  vi.unstubAllGlobals()
})

describe("UC-1 documented mutation via mock HTTP", () => {
  it("validates against the saved runtime SDL", () => {
    expect(validate(buildSchema(readFileSync("docs/graphql/superadmin/v1/runtime.graphql", "utf8")), BAN_USER)).toEqual(
      [],
    )
  })
  it.each([
    { code: "BAD_BEHAVIOR" as const },
    { code: "ADVERTISING_PLACEMENT" as const },
    { code: "ANOTHER_REASON" as const, text: "  Mock reason  " },
  ])("sends $code with exact variables and one mutation", async (reason: BanReasonInput) => {
    reply("BLOCKED")
    await expect(banSuperadminUser(client(), userId, reason)).resolves.toEqual({ userId, outcome: "BLOCKED" })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const options = fetchMock.mock.calls[0]?.[1]
    expect(options?.credentials).toBe("include")
    expect(JSON.parse(String(options?.body))).toMatchObject({
      operationName: "SuperadminBanUser",
      variables: { input: { userId }, reason: getBanReason(reason.code, "text" in reason ? reason.text : "") },
    })
  })
  it.each(["BLOCKED", "ALREADY_BLOCKED", "NOT_FOUND", "USER_DELETED"])(
    "preserves documented outcome %s",
    async (outcome) => {
      reply(outcome)
      await expect(banSuperadminUser(client(), userId, { code: "BAD_BEHAVIOR" })).resolves.toEqual({ userId, outcome })
    },
  )
  it.each(["", " ", "x".repeat(501)])("rejects invalid custom text before any request", async (text) => {
    await expect(banSuperadminUser(client(), userId, { code: "ANOTHER_REASON", text })).rejects.toThrow()
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it("rejects partial success with HTTP 200 GraphQL errors and does not retry", async () => {
    reply("BLOCKED", userId, [{ message: "Access denied", extensions: { code: "FORBIDDEN" } }])
    await expect(banSuperadminUser(client(), userId, { code: "BAD_BEHAVIOR" })).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it.each([
    ["UNKNOWN", userId],
    ["BLOCKED", "another-id"],
  ])("rejects unconfirmed result %s / %s", async (outcome, id) => {
    reply(outcome, id)
    await expect(banSuperadminUser(client(), userId, { code: "BAD_BEHAVIOR" })).rejects.toThrow(
      "Ban result not confirmed",
    )
  })
  it("does not retry a network failure", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Mock connection lost"))
    await expect(banSuperadminUser(client(), userId, { code: "BAD_BEHAVIOR" })).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it("uses the existing transport nonce without session bootstrap per mutation", async () => {
    const instance = client()
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { superadminSession: { authenticated: true } } }), {
        headers: { "Content-Type": "application/json", "X-Superadmin-CSRF": "mock-ban-nonce" },
      }),
    )
    await instance.query({
      query: gql`
        query MockSession {
          superadminSession {
            authenticated
          }
        }
      `,
    })
    fetchMock.mockClear()
    reply("BLOCKED")
    await banSuperadminUser(instance, userId, { code: "BAD_BEHAVIOR" })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get("X-Superadmin-CSRF")).toBe("mock-ban-nonce")
  })
})
