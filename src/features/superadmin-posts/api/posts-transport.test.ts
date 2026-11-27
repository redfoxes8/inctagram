import type { ApolloClient } from "@apollo/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { makeApolloClient } from "@/shared/api/apollo/client"
import { createPostsFeed, initialFeedState, type FeedState } from "@/features/superadmin-posts/model/posts-feed"

const ws = vi.hoisted(() => ({ create: vi.fn(), subscribe: vi.fn(), dispose: vi.fn() }))
vi.mock("graphql-ws", () => ({ createClient: ws.create }))
const fetchMock = vi.fn<typeof fetch>()
const item = {
  postId: "test-post",
  userId: "test-author",
  username: "alice",
  description: "Test only",
  publishedAt: "2026-11-27T10:00:00.000Z",
  images: [],
}
const pageInfo = { endCursor: "opaque-test", hasNextPage: true }
let state: FeedState
let client: ApolloClient
let feed: ReturnType<typeof createPostsFeed>
function response() {
  return new Response(JSON.stringify({ data: { superadminPosts: { items: [item], pageInfo } } }), {
    headers: { "Content-Type": "application/json" },
  })
}
async function settle() {
  for (let i = 0; i < 60; i++) await Promise.resolve()
}
beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  vi.stubEnv("NEXT_PUBLIC_SUPERADMIN_GRAPHQL_URL", "https://mock.invalid/api/v1/graphql")
  vi.stubGlobal("window", {})
  vi.stubGlobal("fetch", fetchMock)
  ws.create.mockReturnValue({ subscribe: ws.subscribe, dispose: ws.dispose })
  state = initialFeedState
  client = makeApolloClient()
  feed = createPostsFeed(client, (value) => {
    state = value
  })
})
afterEach(() => {
  feed.stop()
  client.stop()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe("posts using production Apollo split with mocked HTTP/WS, no Gateway", () => {
  it("sends the initial query through HTTP and displays its result even if WS fails synchronously", async () => {
    ws.subscribe.mockImplementation((_payload, sink) => {
      sink.error(new Error("Test WSS unavailable"))
      return vi.fn()
    })
    fetchMock.mockResolvedValueOnce(response())
    feed.start("alice")
    await settle()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]!
    expect(url).toBe("https://mock.invalid/api/v1/graphql")
    expect(options).toMatchObject({ method: "POST", credentials: "include" })
    const payload = JSON.parse(String(options?.body))
    expect(payload.operationName).toBe("SuperadminPostsPage")
    expect(payload.variables).toEqual({ input: { first: 4, searchUsername: "alice" } })
    expect(ws.subscribe.mock.calls[0]![0].operationName).toBe("SuperadminPostsLive")
    expect(state.status).toBe("ready")
    expect(state.items).toEqual([item])
    expect(state.pageInfo).toEqual(pageInfo)
    expect(state.connectionStatus).toBe("reconnecting")
    expect(state.connectionError).toContain("disconnected")
    expect(state.error).toBe("")
  })
  it("shows HTTP results without receiving WS READY and retains them after a WS timeout", async () => {
    ws.subscribe.mockReturnValue(vi.fn())
    fetchMock.mockResolvedValueOnce(response())
    feed.start()
    await settle()
    expect(state.items).toEqual([item])
    expect(state.status).toBe("ready")
    expect(state.connectionStatus).toBe("connecting")
    await vi.advanceTimersByTimeAsync(15000)
    expect(state.items).toEqual([item])
    expect(state.pageInfo).toEqual(pageInfo)
    expect(state.status).toBe("ready")
    expect(state.connectionStatus).toBe("reconnecting")
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it("keeps initial HTTP in flight when WS fails and allows pagination while WS is down", async () => {
    let resolve!: (response: Response) => void
    fetchMock.mockReturnValueOnce(
      new Promise((done) => {
        resolve = done
      }),
    )
    ws.subscribe.mockImplementation((_payload, sink) => {
      sink.error(new Error("Test disconnect"))
      return vi.fn()
    })
    feed.start()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]![1]?.signal?.aborted).toBe(false)
    resolve(response())
    await settle()
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ data: { superadminPosts: { items: [], pageInfo: { endCursor: null, hasNextPage: false } } } }),
        { headers: { "Content-Type": "application/json" } },
      ),
    )
    await feed.loadMore()
    expect(JSON.parse(String(fetchMock.mock.calls[1]![1]?.body)).variables.input.after).toBe("opaque-test")
    expect(state.items).toEqual([item])
    expect(state.pageInfo?.hasNextPage).toBe(false)
    expect(state.connectionStatus).toBe("reconnecting")
  })
})
