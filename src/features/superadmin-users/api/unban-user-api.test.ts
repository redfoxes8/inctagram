import { readFileSync } from "node:fs"
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client"
import { buildSchema, validate } from "graphql"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createSuperadminTransport } from "@/shared/api/apollo/transport"
import { UNBAN_USER, unbanSuperadminUser } from "@/features/superadmin-users/api/unban-user-api"

// Local synthetic data only; all fetches are replaced before constructing a client.
const userId = "00000000-0000-4000-8000-00000000b002"
const fetchMock = vi.fn<typeof fetch>()
const clients: ApolloClient[] = []
function client() {
  const instance = new ApolloClient({
    devtools: { enabled: false },
    cache: new InMemoryCache(),
    link: new HttpLink({ uri: "https://mock.invalid/api/v1/graphql", fetch: createSuperadminTransport() }),
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
    new Response(JSON.stringify({ data: { superadminUnblockUser: { userId: id, outcome } }, errors }), {
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

describe("documented un-ban API through mock fetch", () => {
  it("validates against runtime SDL", () => {
    expect(
      validate(buildSchema(readFileSync("docs/graphql/superadmin/v1/runtime.graphql", "utf8")), UNBAN_USER),
    ).toEqual([])
  })
  it.each(["UNBLOCKED", "ALREADY_ACTIVE", "NOT_FOUND", "USER_DELETED"])(
    "preserves %s and sends exact input once",
    async (outcome) => {
      reply(outcome)
      await expect(unbanSuperadminUser(client(), userId)).resolves.toEqual({ userId, outcome })
      expect(fetchMock).toHaveBeenCalledTimes(1)
      const options = fetchMock.mock.calls[0]?.[1]
      expect(options?.credentials).toBe("include")
      expect(options?.method).toBe("POST")
      expect(JSON.parse(String(options?.body))).toMatchObject({
        operationName: "SuperadminUnbanUser",
        variables: { input: { userId } },
      })
      expect(JSON.parse(String(options?.body)).variables).not.toHaveProperty("reason")
    },
  )
  it("rejects partial success with GraphQL errors even on HTTP 200", async () => {
    reply("UNBLOCKED", userId, [{ message: "Access denied", extensions: { code: "FORBIDDEN" } }])
    await expect(unbanSuperadminUser(client(), userId)).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it.each([
    ["UNKNOWN", userId],
    ["UNBLOCKED", "wrong-id"],
  ])("rejects an unconfirmed result: %s / %s", async (outcome, id) => {
    reply(outcome, id)
    await expect(unbanSuperadminUser(client(), userId)).rejects.toThrow("Un-ban result not confirmed")
  })
  it("does not retry network failures", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Mock connection lost"))
    await expect(unbanSuperadminUser(client(), userId)).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it("uses the existing session nonce without session bootstrap before un-ban", async () => {
    const instance = client()
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { superadminSession: { authenticated: true } } }), {
        headers: { "Content-Type": "application/json", "X-Superadmin-CSRF": "mock-unban-nonce" },
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
    reply("UNBLOCKED")
    await unbanSuperadminUser(instance, userId)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get("X-Superadmin-CSRF")).toBe("mock-unban-nonce")
  })
})
