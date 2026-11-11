import { readFileSync } from "node:fs"
import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client"
import { buildSchema, validate } from "graphql"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createSuperadminTransport } from "@/shared/api/apollo/transport"
import {
  isSuperadminSessionUnauthenticated,
  restoreSuperadminSession,
  SUPERADMIN_SESSION,
} from "@/features/auth/api/superadmin-session"

const fetchMock = vi.fn<typeof fetch>()
const clients: ApolloClient[] = []
const nonce = "mock-session-nonce"
// Mock-only mutation: no Gateway or real account is contacted.
const MUTATION = gql`
  mutation MockDelete($input: SuperadminUserIdInput!) {
    superadminDeleteUser(input: $input) {
      userId
      outcome
    }
  }
`
const userId = "00000000-0000-4000-8000-00000000d003"

function response(body: unknown, csrf?: string) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", ...(csrf ? { "X-Superadmin-CSRF": csrf } : {}) },
  })
}
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
beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal("window", {})
  vi.stubGlobal("fetch", fetchMock)
})
afterEach(() => {
  clients.splice(0).forEach((instance) => instance.stop())
  vi.unstubAllGlobals()
})

describe("superadmin session bootstrap with the existing transport", () => {
  it("uses the saved runtime contract", () => {
    const schema = buildSchema(readFileSync("docs/graphql/superadmin/v1/runtime.graphql", "utf8"))
    expect(validate(schema, SUPERADMIN_SESSION)).toEqual([])
    expect(validate(schema, MUTATION)).toEqual([])
  })

  it("starts without a nonce, captures the session response header, and sends it with the next mutation", async () => {
    const instance = client()
    fetchMock.mockResolvedValueOnce(response({ data: { superadminSession: { authenticated: true } } }, nonce))
    await restoreSuperadminSession(instance)
    const sessionOptions = fetchMock.mock.calls[0]?.[1]
    expect(sessionOptions?.credentials).toBe("include")
    expect(new Headers(sessionOptions?.headers).has("X-Superadmin-CSRF")).toBe(false)

    fetchMock.mockResolvedValueOnce(response({ data: { superadminDeleteUser: { userId, outcome: "DELETED" } } }))
    await instance.mutate({ mutation: MUTATION, variables: { input: { userId } } })
    const mutationOptions = fetchMock.mock.calls[1]?.[1]
    expect(mutationOptions?.credentials).toBe("include")
    expect(new Headers(mutationOptions?.headers).get("X-Superadmin-CSRF")).toBe(nonce)
    expect(fetchMock.mock.calls.map(([, options]) => JSON.parse(String(options?.body)).operationName)).toEqual([
      "RestoreSuperadminSession",
      "MockDelete",
    ])
  })

  it.each(["UNAUTHENTICATED", "FORBIDDEN", "UPSTREAM_UNAVAILABLE"])("preserves %s without retry", async (code) => {
    fetchMock.mockResolvedValueOnce(response({ errors: [{ message: "Mock error", extensions: { code } }] }))
    let failure: unknown
    try {
      await restoreSuperadminSession(client())
    } catch (error) {
      failure = error
    }
    expect(failure).toBeDefined()
    expect(isSuperadminSessionUnauthenticated(failure)).toBe(code === "UNAUTHENTICATED")
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("rejects an unconfirmed session without treating it as successful bootstrap", async () => {
    fetchMock.mockResolvedValueOnce(response({ data: { superadminSession: { authenticated: false } } }))
    await expect(restoreSuperadminSession(client())).rejects.toThrow("Admin session not confirmed")
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
