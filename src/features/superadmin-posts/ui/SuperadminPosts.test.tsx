import { Children, isValidElement, type ComponentProps, type ReactElement, type ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SuperadminPosts } from "@/features/superadmin-posts/ui/SuperadminPosts"
import { initialFeedState, type FeedState } from "@/features/superadmin-posts/model/posts-feed"
import { Input } from "@/shared/ui/Input"

const hooks = vi.hoisted(() => ({
  values: [] as unknown[],
  index: 0,
  effects: [] as (() => (() => void) | undefined)[],
  start: vi.fn(),
  stop: vi.fn(),
  loadMore: vi.fn(),
  retryHead: vi.fn(),
  retryConnection: vi.fn(),
  observe: vi.fn(),
  disconnect: vi.fn(),
  intersect: undefined as ((entries: { isIntersecting: boolean }[]) => void) | undefined,
}))
vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useState: (initial: unknown) => {
    const index = hooks.index++
    if (!(index in hooks.values)) hooks.values[index] = initial
    return [
      hooks.values[index],
      (value: unknown) => {
        hooks.values[index] = value
      },
    ]
  },
  useRef: () => ({ current: {} }),
  useMemo: (factory: () => unknown) => factory(),
  useEffect: (effect: () => (() => void) | undefined) => {
    hooks.effects.push(effect)
  },
}))
vi.mock("@apollo/client/react", () => ({ useApolloClient: () => ({}) }))
vi.mock("@/features/superadmin-posts/model/posts-feed", async (original) => ({
  ...(await original<typeof import("@/features/superadmin-posts/model/posts-feed")>()),
  createPostsFeed: () => ({
    start: hooks.start,
    stop: hooks.stop,
    loadMore: hooks.loadMore,
    retryHead: hooks.retryHead,
    retryConnection: hooks.retryConnection,
  }),
}))
function find(
  tree: ReactNode,
  predicate: (element: ReactElement<Record<string, unknown>>) => boolean,
): ReactElement<Record<string, unknown>> {
  let found: ReactElement<Record<string, unknown>> | undefined
  Children.forEach(tree, (item) => {
    if (!isValidElement<Record<string, unknown>>(item)) return
    if (predicate(item)) found = item
    else if (item.props.children) {
      try {
        found = find(item.props.children as ReactNode, predicate)
      } catch {
        /* Continue siblings. */
      }
    }
  })
  if (!found) throw new Error("Missing element")
  return found
}
function shell() {
  hooks.index = 0
  return SuperadminPosts({ onBan: vi.fn(), banPending: false })
}
function feedElement() {
  return find(shell(), (item) => typeof item.type === "function" && item.type.name === "PostsFeed")
}
function renderFeed(state: FeedState) {
  const element = feedElement()
  hooks.values = [state]
  hooks.index = 0
  hooks.effects = []
  return (element.type as (props: unknown) => ReactElement)(element.props)
}
beforeEach(() => {
  hooks.values = []
  hooks.index = 0
  hooks.effects = []
  hooks.intersect = undefined
  vi.clearAllMocks()
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: typeof hooks.intersect) {
        hooks.intersect = callback
      }
      observe = hooks.observe
      disconnect = hooks.disconnect
    },
  )
})
afterEach(() => vi.unstubAllGlobals())

describe("posts UI controls (local hooks and IntersectionObserver, no network)", () => {
  it("applies trimmed search on submit and remounts the feed to discard prior list state", () => {
    const input = find(shell(), (item) => item.type === Input).props as ComponentProps<typeof Input>
    input.onChange?.({ target: { value: "  alice  " } } as Parameters<NonNullable<typeof input.onChange>>[0])
    const form = find(shell(), (item) => item.type === "form")
    ;(form.props.onSubmit as (event: { preventDefault(): void }) => void)({ preventDefault: vi.fn() })
    expect(feedElement().key).toBe("alice")
    expect(feedElement().props.search).toBe("alice")
  })
  it("starts and stops the controller with the component lifecycle", () => {
    renderFeed(initialFeedState)
    const cleanup = hooks.effects[0]!()
    expect(hooks.start).toHaveBeenCalledExactlyOnceWith("")
    cleanup?.()
    expect(hooks.stop).toHaveBeenCalledTimes(1)
  })
  it("loads the next page only when the sentinel intersects and disconnects on cleanup", () => {
    renderFeed({ ...initialFeedState, status: "ready", pageInfo: { endCursor: "opaque", hasNextPage: true } })
    const cleanup = hooks.effects[1]!()
    expect(hooks.observe).toHaveBeenCalledTimes(1)
    hooks.intersect?.([{ isIntersecting: false }])
    expect(hooks.loadMore).not.toHaveBeenCalled()
    hooks.intersect?.([{ isIntersecting: true }])
    expect(hooks.loadMore).toHaveBeenCalledTimes(1)
    cleanup?.()
    expect(hooks.disconnect).toHaveBeenCalledTimes(1)
  })
  it.each(["connecting", "reconnecting", "error"] as const)(
    "keeps posts and scroll available while live updates are %s",
    (connectionStatus) => {
      const items = [
        {
          postId: "test-post",
          userId: "test-author",
          username: "alice",
          description: "Test only",
          publishedAt: "2026-11-27T10:00:00.000Z",
          images: [],
        },
      ]
      const tree = renderFeed({
        ...initialFeedState,
        status: "ready",
        items,
        pageInfo: { endCursor: "opaque", hasNextPage: true },
        connectionStatus,
        connectionError: connectionStatus === "connecting" ? "" : "Test live updates unavailable",
      })
      expect(find(tree, (item) => item.props["aria-label"] === "Posts")).toBeDefined()
      if (connectionStatus !== "connecting") {
        expect(JSON.stringify(tree)).toContain("Test live updates unavailable")
        const retry = find(tree, (item) => item.props.children === "Retry live updates")
        ;(retry.props.onClick as () => void)()
        expect(hooks.retryConnection).toHaveBeenCalledTimes(1)
        expect(hooks.start).not.toHaveBeenCalled()
      }
      hooks.effects[1]!()
      expect(hooks.observe).toHaveBeenCalledTimes(1)
    },
  )
  it.each([
    { status: "loading" },
    { status: "error" },
    { loadingMore: true },
    { error: "Test page outage" },
    { pageInfo: { endCursor: null, hasNextPage: false } },
  ] as Partial<FeedState>[])("does not automatically page while blocked: %j", (patch) => {
    renderFeed({ ...initialFeedState, status: "ready", pageInfo: { endCursor: "opaque", hasNextPage: true }, ...patch })
    hooks.effects[1]!()
    expect(hooks.observe).not.toHaveBeenCalled()
  })
  it("distinguishes loading, empty success, pagination errors and expired sessions", () => {
    let tree = renderFeed(initialFeedState)
    expect(JSON.stringify(tree)).toContain("Loading posts")
    tree = renderFeed({ ...initialFeedState, status: "ready", pageInfo: { endCursor: null, hasNextPage: false } })
    expect(JSON.stringify(tree)).toContain("No posts found")
    tree = renderFeed({ ...initialFeedState, status: "ready", retryTarget: "page", error: "Test page error" })
    const retry = find(tree, (item) => item.props.children === "Retry")
    ;(retry.props.onClick as () => void)()
    expect(hooks.loadMore).toHaveBeenCalledTimes(1)
    tree = renderFeed({ ...initialFeedState, status: "login", error: "Please sign in again." })
    expect(find(tree, (item) => item.props.href === "/superadmin/sign-in")).toBeDefined()
  })
})
