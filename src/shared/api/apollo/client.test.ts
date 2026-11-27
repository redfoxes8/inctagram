import { gql, type ApolloClient } from "@apollo/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { makeApolloClient } from "@/shared/api/apollo/client"

const ws = vi.hoisted(() => ({ create: vi.fn(), subscribe: vi.fn(), dispose: vi.fn() }))
vi.mock("graphql-ws", () => ({ createClient: ws.create }))
const SESSION = gql`
  query TransportTestSession {
    superadminSession {
      authenticated
    }
  }
`
const LIVE = gql`
  subscription TransportTestLive($input: SuperadminPostPublishedInput!) {
    superadminPostPublished(input: $input) {
      kind
    }
  }
`
const BAN = gql`
  mutation TransportTestBan($input: SuperadminUserIdInput!) {
    superadminBlockUser(input: $input) {
      userId
      outcome
    }
  }
`
const fetchMock = vi.fn<typeof fetch>()
const clients: ApolloClient[] = []
function client() {
  const result = makeApolloClient()
  clients.push(result)
  return result
}
function response(data: unknown, nonce?: string) {
  return new Response(JSON.stringify({ data }), {
    headers: { "Content-Type": "application/json", ...(nonce ? { "X-Superadmin-CSRF": nonce } : {}) },
  })
}
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPERADMIN_GRAPHQL_URL", "https://mock.invalid/api/v1/graphql")
  vi.stubGlobal("window", {})
  vi.stubGlobal("fetch", fetchMock)
  vi.clearAllMocks()
  ws.subscribe.mockReturnValue(vi.fn())
  ws.create.mockReturnValue({ subscribe: ws.subscribe, dispose: ws.dispose })
})
afterEach(() => {
  clients.splice(0).forEach((c) => c.stop())
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe("Apollo HTTP/WS split (mock transports only)", () => {
  it("does not require configuration or open a socket when mounting the client", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPERADMIN_GRAPHQL_URL", "")
    expect(() => client()).not.toThrow()
    expect(ws.create).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it.each([
    ["https:", "wss:"],
    ["http:", "ws:"],
  ])("routes %s subscriptions to %s and disposes their socket", (http, socket) => {
    vi.stubEnv("NEXT_PUBLIC_SUPERADMIN_GRAPHQL_URL", `${http}//mock.invalid/api/v1/graphql`)
    const sub = client()
      .subscribe({ query: LIVE, variables: { input: {} } })
      .subscribe({})
    expect(ws.create).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        url: `${socket}//mock.invalid/api/v1/graphql`,
        lazy: true,
        retryAttempts: 0,
        keepAlive: 0,
      }),
    )
    expect(ws.create.mock.calls[0]![0]).not.toHaveProperty("connectionParams")
    expect(ws.subscribe.mock.calls[0]![0].variables).toEqual({ input: {} })
    expect(fetchMock).not.toHaveBeenCalled()
    sub.unsubscribe()
    expect(ws.dispose).toHaveBeenCalledTimes(1)
  })
  it("keeps HTTP POST/cookies/no-store and the session nonce across a subscription", async () => {
    const instance = client()
    fetchMock.mockResolvedValueOnce(response({ superadminSession: { authenticated: true } }, "test-nonce"))
    await instance.query({ query: SESSION })
    const subscription = instance.subscribe({ query: LIVE, variables: { input: {} } }).subscribe({})
    fetchMock.mockResolvedValueOnce(response({ superadminBlockUser: { userId: "test-only", outcome: "BLOCKED" } }))
    await instance.mutate({ mutation: BAN, variables: { input: { userId: "test-only" } } })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    for (const [url, options] of fetchMock.mock.calls) {
      expect(url).toBe("https://mock.invalid/api/v1/graphql")
      expect(options).toMatchObject({ method: "POST", credentials: "include", cache: "no-store" })
    }
    expect(new Headers(fetchMock.mock.calls[0]![1]?.headers).has("X-Superadmin-CSRF")).toBe(false)
    expect(new Headers(fetchMock.mock.calls[1]![1]?.headers).get("X-Superadmin-CSRF")).toBe("test-nonce")
    subscription.unsubscribe()
  })
  it("rejects HTTP and subscription networking during SSR", async () => {
    vi.stubGlobal("window", undefined)
    const instance = client()
    const result = await instance.query({ query: SESSION })
    expect(result.error?.message).toContain("only supported in the browser")
    const failure = await new Promise<unknown>((resolve) =>
      instance
        .subscribe({ query: LIVE, variables: { input: {} } })
        .subscribe({ next: (result) => resolve(result.error), error: resolve }),
    )
    expect(String(failure)).toContain("only supported in the browser")
    expect(fetchMock).not.toHaveBeenCalled()
    expect(ws.create).not.toHaveBeenCalled()
  })
})
