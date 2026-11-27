import { readFileSync } from "node:fs"
import { ApolloClient, ApolloLink, InMemoryCache, Observable, type Operation, type FetchResult } from "@apollo/client"
import type { Subscriber } from "rxjs"
import { buildSchema, validate } from "graphql"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { POSTS_QUERY, POSTS_SUBSCRIPTION } from "@/features/superadmin-posts/api/posts-api"
import { createPostsFeed, initialFeedState, type FeedState } from "@/features/superadmin-posts/model/posts-feed"
import { mergePosts, type SuperadminPost } from "@/features/superadmin-posts/model/types"

function post(
  postId: string,
  username: string | null = "alice",
  publishedAt = "2026-11-27T10:00:00.000Z",
): SuperadminPost {
  return { postId, userId: `author-${postId}`, username, publishedAt, description: "Test only", images: [] }
}
type Request = { operation: Operation; sink: Subscriber<FetchResult>; disposed: boolean }
let requests: Request[]
let state: FeedState
let client: ApolloClient
let feed: ReturnType<typeof createPostsFeed>
const queries = () => requests.filter((r) => r.operation.operationType === "query")
const subscriptions = () => requests.filter((r) => r.operation.operationType === "subscription")
const live = () => subscriptions().at(-1)!
function event(kind: string, item: SuperadminPost | null = null, request = live()) {
  request.sink.next({ data: { superadminPostPublished: { kind, post: item } } })
}
function page(items: SuperadminPost[], cursor: string | null, hasNextPage: boolean, request = queries().at(-1)!) {
  request.sink.next({ data: { superadminPosts: { items, pageInfo: { endCursor: cursor, hasNextPage } } } })
  request.sink.complete()
}
async function settle() {
  for (let i = 0; i < 30; i++) await Promise.resolve()
}
async function head(items = [post("b")], cursor: string | null = "opaque-1", hasNextPage = true) {
  if (queries().length && !queries().at(-1)!.disposed) {
    page(items, cursor, hasNextPage)
    await settle()
  }
  event("READY")
  await settle()
  page(items, cursor, hasNextPage)
  await settle()
}
beforeEach(() => {
  vi.useFakeTimers()
  requests = []
  state = initialFeedState
  client = new ApolloClient({
    cache: new InMemoryCache(),
    defaultOptions: {
      query: { errorPolicy: "all" },
      watchQuery: { errorPolicy: "all" },
      mutate: { errorPolicy: "all" },
    },
    link: new ApolloLink(
      (operation) =>
        new Observable((sink) => {
          const request = { operation, sink, disposed: false }
          requests.push(request)
          return () => {
            request.disposed = true
          }
        }),
    ),
  })
  feed = createPostsFeed(client, (value) => {
    state = value
  })
})
afterEach(() => {
  feed.stop()
  client.stop()
  vi.useRealTimers()
})

describe("posts feed using real Apollo and test-only link (no network)", () => {
  it("validates both operations against runtime SDL", () => {
    const schema = buildSchema(readFileSync("docs/graphql/superadmin/v1/runtime.graphql", "utf8"))
    expect(validate(schema, POSTS_QUERY)).toEqual([])
    expect(validate(schema, POSTS_SUBSCRIPTION)).toEqual([])
  })
  it("starts HTTP before READY and merges buffered events with the reconciliation snapshot", async () => {
    feed.start()
    expect(queries()).toHaveLength(1)
    page([post("b")], "initial-cursor", true)
    await settle()
    event("READY")
    await settle()
    event("POST_PUBLISHED", post("d"))
    event("POST_PUBLISHED", post("d"))
    event("POST_PUBLISHED", post("a", "alice", "2026-11-26T10:00:00.000Z"))
    page([post("b"), post("d")], "opaque-1", true)
    await settle()
    expect(state.status).toBe("ready")
    expect(state.items.map((p) => p.postId)).toEqual(["d", "b", "a"])
    event("POST_PUBLISHED", post("c"))
    expect(state.items.map((p) => p.postId)).toEqual(["d", "c", "b", "a"])
  })
  it("queues a post-READY snapshot when initial HTTP is pending and dedupes events in both snapshots", async () => {
    feed.start()
    const initial = queries()[0]!
    event("READY")
    event("POST_PUBLISHED", post("d"))
    expect(queries()).toHaveLength(1)
    page([post("b")], "before-ready", true, initial)
    await settle()
    expect(queries()).toHaveLength(2)
    expect(state.items.map((p) => p.postId)).toEqual(["d", "b"])
    event("POST_PUBLISHED", post("d"))
    event("POST_PUBLISHED", post("c"))
    page([post("d"), post("b")], "after-ready", true)
    await settle()
    expect(state.items.map((p) => p.postId)).toEqual(["d", "c", "b"])
    expect(state.pageInfo?.endCursor).toBe("after-ready")
  })
  it("uses fetchMore once per cursor, dedupes overlapping pages, and stops at the end", async () => {
    const fetchMore = vi.spyOn(client, "watchQuery")
    feed.start()
    await head()
    const query = fetchMore.mock.results[0]!.value
    const moreSpy = vi.spyOn(query, "fetchMore")
    const loading = feed.loadMore()
    await feed.loadMore()
    await settle()
    expect(moreSpy).toHaveBeenCalledTimes(1)
    expect(queries()).toHaveLength(3)
    expect(queries()[2]!.operation.variables).toEqual({ input: { first: 4, searchUsername: "", after: "opaque-1" } })
    event("POST_PUBLISHED", post("d"))
    page([post("b"), post("a")], null, false)
    await loading
    expect(state.items.map((p) => p.postId)).toEqual(["d", "b", "a"])
    await feed.loadMore()
    expect(queries()).toHaveLength(3)
    expect(state.loadingMore).toBe(false)
  })
  it("resets search, list and cursor, cancels old work and ignores a late previous page", async () => {
    feed.start()
    await head()
    const pending = feed.loadMore()
    await settle()
    const old = queries().at(-1)!
    const previousLive = live()
    feed.start("  BoB  ")
    expect(previousLive.disposed).toBe(true)
    expect(state.items).toEqual([])
    expect(state.pageInfo).toBeNull()
    expect(live().operation.variables).toEqual({ input: { searchUsername: "BoB" } })
    page([post("stale")], "old-cursor", true, old)
    await pending
    await settle()
    expect(queries().at(-1)!.operation.variables).toEqual({ input: { first: 4, searchUsername: "BoB" } })
    page([post("bob", "bobby")], null, false)
    await settle()
    event("READY")
    await settle()
    page([post("bob", "bobby")], null, false)
    await settle()
    event("POST_PUBLISHED", post("ignored", "alice"))
    event("POST_PUBLISHED", post("unknown", null))
    event("POST_PUBLISHED", post("new", "BOBBY"))
    expect(state.items.map((p) => p.postId)).toEqual(["new", "bob"])
  })
  it.each(["RESYNC_REQUIRED", "complete", "error"])(
    "recovers %s through new READY and snapshot without an old cursor",
    async (reason) => {
      feed.start()
      await head()
      if (reason === "complete") live().sink.complete()
      else if (reason === "error") live().sink.error(new Error("Test disconnect"))
      else event(reason)
      expect(state.pageInfo?.endCursor).toBe("opaque-1")
      expect(state.status).toBe("ready")
      expect(state.connectionStatus).toBe("reconnecting")
      await vi.advanceTimersByTimeAsync(1200)
      expect(subscriptions()).toHaveLength(2)
      await head([post("new")], "new-cursor")
      expect(queries().at(-1)!.operation.variables.input).not.toHaveProperty("after")
      expect(state.items.map((p) => p.postId)).toEqual(["new"])
      expect(state.pageInfo?.endCursor).toBe("new-cursor")
    },
  )
  it.each(["next", "error"])("stops auth failures delivered by %s without retrying", async (path) => {
    feed.start()
    const errors = [{ message: "Test expired session", extensions: { code: "UNAUTHENTICATED" } }]
    if (path === "next") live().sink.next({ errors })
    else live().sink.error(new (await import("@apollo/client/errors")).CombinedGraphQLErrors({ errors }))
    await settle()
    expect(state.connectionStatus).toBe("login")
    await vi.advanceTimersByTimeAsync(60000)
    expect(subscriptions()).toHaveLength(1)
  })
  it("limits consecutive failures to ten, bounds startup wait and permits an explicit retry", async () => {
    feed.start()
    for (let i = 0; i < 10; i++) {
      await vi.advanceTimersByTimeAsync(15000)
      if (i < 9) await vi.advanceTimersToNextTimerAsync()
    }
    expect(subscriptions()).toHaveLength(10)
    expect(state.connectionStatus).toBe("error")
    await vi.advanceTimersByTimeAsync(120000)
    expect(subscriptions()).toHaveLength(10)
    feed.retryConnection()
    expect(subscriptions()).toHaveLength(11)
    expect(state.status).toBe("loading")
  })
  it("does not confuse a null/error snapshot with an empty successful result", async () => {
    feed.start()
    await settle()
    queries()[0]!.sink.next({
      data: { superadminPosts: null },
      errors: [{ message: "Test unavailable", extensions: { code: "UPSTREAM_UNAVAILABLE" } }],
    })
    queries()[0]!.sink.complete()
    await settle()
    expect(state.status).toBe("error")
    expect(state.pageInfo).toBeNull()
    feed.start()
    await head([], null, false)
    expect(state.status).toBe("ready")
    expect(state.items).toEqual([])
  })
  it("keeps the failed pagination cursor for manual retry and suppresses work after stop", async () => {
    feed.start()
    await head()
    const pending = feed.loadMore()
    await settle()
    queries().at(-1)!.sink.error(new Error("Test page outage"))
    await pending
    expect(state.error).toContain("load more")
    expect(state.pageInfo?.endCursor).toBe("opaque-1")
    const retried = feed.loadMore()
    await settle()
    page([], null, false)
    await retried
    expect(state.error).toBe("")
    feed.stop()
    await vi.advanceTimersByTimeAsync(120000)
    expect(live().disposed).toBe(true)
    expect(subscriptions()).toHaveLength(1)
  })
  it("treats percent and underscore literally and retains missing usernames only without search", () => {
    expect(
      mergePosts([], [post("a", "user%_name"), post("b", "userXXname"), post("c", null)], "%_").map((p) => p.postId),
    ).toEqual(["a"])
    expect(mergePosts([], [post("c", null)], "")).toHaveLength(1)
  })
})
