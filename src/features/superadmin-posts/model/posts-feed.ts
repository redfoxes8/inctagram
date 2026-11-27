import type { ApolloClient, ObservableQuery } from "@apollo/client"
import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { POSTS_QUERY, POSTS_SUBSCRIPTION } from "@/features/superadmin-posts/api/posts-api"
import {
  mergePosts,
  type PostsInput,
  type PostsPage,
  type SuperadminPost,
} from "@/features/superadmin-posts/model/types"

export type FeedState = {
  items: SuperadminPost[]
  pageInfo: PostsPage["pageInfo"] | null
  status: "loading" | "ready" | "error" | "login"
  connectionStatus: "connecting" | "ready" | "reconnecting" | "error" | "login"
  connectionError: string
  retryTarget: "head" | "page"
  loadingMore: boolean
  error: string
}
export const initialFeedState: FeedState = {
  items: [],
  pageInfo: null,
  status: "loading",
  connectionStatus: "connecting",
  connectionError: "",
  retryTarget: "head",
  loadingMore: false,
  error: "",
}

function failureKind(error: unknown): "login" | "diagnostic" | "transient" {
  const codes = CombinedGraphQLErrors.is(error) ? error.errors.map((item) => item.extensions?.code) : []
  const closeCode = error && typeof error === "object" && "code" in error ? error.code : undefined
  if (codes.includes("UNAUTHENTICATED") || closeCode === 4401) return "login"
  if (
    codes.some((code) =>
      [
        "FORBIDDEN",
        "BAD_USER_INPUT",
        "GRAPHQL_VALIDATION_FAILED",
        "GRAPHQL_PARSE_FAILED",
        "TOO_MANY_REQUESTS",
        "INTERNAL_SERVER_ERROR",
      ].includes(String(code)),
    ) ||
    [4400, 4403, 4406, 4408, 4409, 4429, 4500, 4004, 4005].includes(Number(closeCode))
  )
    return "diagnostic"
  return "transient"
}

// HTTP owns list state; the bounded WS supervisor owns only realtime state.
// Search/unmount cancels both, but a broken WS never cancels an HTTP request.
export function createPostsFeed(client: ApolloClient, onChange: (state: FeedState) => void) {
  let state = initialFeedState
  let search = ""
  let generation = 0
  let wsGeneration = 0
  let headEpoch = 0
  let attempts = 0
  let running = false
  let hasSnapshot = false
  let headPending = false
  let refreshQueued = false
  let buffered: SuperadminPost[] = []
  let live: { unsubscribe(): void } | undefined
  let query: ObservableQuery<{ superadminPosts: PostsPage | null }, { input: PostsInput }> | undefined
  let abort: AbortController | undefined
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let startupTimer: ReturnType<typeof setTimeout> | undefined
  let stableTimer: ReturnType<typeof setTimeout> | undefined
  const publish = (patch: Partial<FeedState>) => {
    state = { ...state, ...patch }
    onChange(state)
  }
  const cleanupConnection = () => {
    wsGeneration++
    clearTimeout(retryTimer)
    clearTimeout(startupTimer)
    clearTimeout(stableTimer)
    live?.unsubscribe()
    live = undefined
  }
  const cleanup = () => {
    generation++
    cleanupConnection()
    abort?.abort()
    query?.stop()
    query = undefined
    headPending = false
    refreshQueued = false
    buffered = []
  }
  const markStable = () => {
    if (state.connectionStatus !== "ready") return
    const current = wsGeneration
    clearTimeout(stableTimer)
    stableTimer = setTimeout(() => {
      if (current === wsGeneration) attempts = 0
    }, 30000)
  }
  async function readHead() {
    if (!running || !query) return
    // A READY arriving during initial HTTP still needs a post-READY snapshot.
    if (headPending) {
      refreshQueued = true
      return
    }
    headPending = true
    const current = generation
    ++headEpoch
    buffered = []
    publish({ pageInfo: null, loadingMore: false, error: "", retryTarget: "head" })
    try {
      const result = await query.refetch()
      if (current !== generation) return
      if (result.error) throw result.error
      const page = result.data?.superadminPosts
      if (!page || (page.pageInfo.hasNextPage && !page.pageInfo.endCursor))
        throw new Error("Posts snapshot not confirmed")
      hasSnapshot = true
      publish({ items: mergePosts(page.items, buffered, search), pageInfo: page.pageInfo, status: "ready", error: "" })
      markStable()
    } catch (error) {
      if (current !== generation) return
      const login = failureKind(error) === "login"
      publish({
        status: login ? "login" : hasSnapshot ? "ready" : "error",
        error: login ? "Your admin session has expired. Please sign in again." : "Unable to load posts. Please retry.",
      })
    } finally {
      if (current === generation) {
        headPending = false
        buffered = []
        if (refreshQueued) {
          refreshQueued = false
          void readHead()
        }
      }
    }
  }
  const failConnection = (error: unknown, current: number) => {
    if (!running || current !== wsGeneration) return
    const kind = failureKind(error)
    cleanupConnection()
    // Keep the list, pagination, and any HTTP operation independent of WS.
    if (kind !== "transient" || attempts >= 10) {
      publish({
        connectionStatus: kind === "login" ? "login" : "error",
        connectionError:
          kind === "login"
            ? "Live updates require an active admin session. Please sign in again."
            : "Live updates unavailable. Check Gateway subscription support and allowed origin, then retry.",
      })
      return
    }
    publish({ connectionStatus: "reconnecting", connectionError: "Live updates disconnected. Reconnecting…" })
    retryTimer = setTimeout(
      beginConnection,
      Math.min(1000 * 2 ** Math.max(0, attempts - 1), 30000) * (0.8 + Math.random() * 0.4),
    )
  }
  function beginConnection() {
    if (!running) return
    const current = ++wsGeneration
    attempts++
    let ready = false
    startupTimer = setTimeout(() => failConnection(new Error("Posts subscription startup timed out"), current), 15000)
    live = client
      .subscribe({
        query: POSTS_SUBSCRIPTION,
        variables: { input: { searchUsername: search } },
        errorPolicy: "all",
      })
      .subscribe({
        next(result) {
          if (current !== wsGeneration) return
          if (result.error) {
            failConnection(result.error, current)
            return
          }
          const event = result.data?.superadminPostPublished
          if (event?.kind === "READY" && !ready) {
            ready = true
            clearTimeout(startupTimer)
            publish({ connectionStatus: "ready", connectionError: "" })
            // Reconcile publications missed before READY or during a disconnect.
            // The initial HTTP page has already started independently.
            void readHead()
          } else if (event?.kind === "POST_PUBLISHED" && event.post && ready) {
            if (headPending) {
              buffered = mergePosts(buffered, [event.post], search)
              if (buffered.length > 200) {
                failConnection(new Error("Posts buffer overflow"), current)
                return
              }
            }
            publish({ items: mergePosts(state.items, [event.post], search) })
          } else failConnection(new Error("Posts resync required"), current)
        },
        error: (error) => failConnection(error, current),
        complete: () => failConnection(new Error("Posts subscription completed"), current),
      })
    // A link may fail synchronously before subscribe() returns its teardown.
    if (current !== wsGeneration) {
      live.unsubscribe()
      live = undefined
    }
  }
  return {
    start(searchUsername = "") {
      running = false
      cleanup()
      attempts = 0
      hasSnapshot = false
      search = searchUsername.trim()
      state = initialFeedState
      publish({})
      running = true
      abort = new AbortController()
      query = client.watchQuery({
        query: POSTS_QUERY,
        variables: { input: { first: 4, searchUsername: search } },
        fetchPolicy: "no-cache",
        errorPolicy: "all",
        context: { queryDeduplication: false, fetchOptions: { signal: abort.signal } },
      })
      void readHead()
      beginConnection()
    },
    stop() {
      running = false
      cleanup()
    },
    retryHead: readHead,
    retryConnection() {
      if (!running) return
      cleanupConnection()
      attempts = 0
      publish({ connectionStatus: "connecting", connectionError: "" })
      beginConnection()
    },
    async loadMore() {
      const cursor = state.pageInfo?.endCursor
      if (
        !running ||
        headPending ||
        state.status !== "ready" ||
        state.loadingMore ||
        !state.pageInfo?.hasNextPage ||
        !cursor ||
        !query
      )
        return
      const current = generation
      const epoch = headEpoch
      publish({ loadingMore: true, error: "", retryTarget: "page" })
      try {
        const result = await query.fetchMore({
          variables: { input: { first: 4, searchUsername: search, after: cursor } },
          // Required for no-cache fetchMore; local state owns the merged list.
          updateQuery: (_previous, { fetchMoreResult }) => fetchMoreResult,
        })
        if (current !== generation || epoch !== headEpoch) return
        if (result.error) throw result.error
        const page = result.data?.superadminPosts
        if (!page || (page.pageInfo.hasNextPage && (!page.pageInfo.endCursor || page.pageInfo.endCursor === cursor)))
          throw new Error("Invalid posts page")
        publish({ items: mergePosts(state.items, page.items, search), pageInfo: page.pageInfo, loadingMore: false })
      } catch (error) {
        if (current !== generation || epoch !== headEpoch) return
        publish({
          loadingMore: false,
          status: failureKind(error) === "login" ? "login" : state.status,
          error:
            failureKind(error) === "login"
              ? "Your admin session has expired. Please sign in again."
              : "Unable to load more posts. Please retry.",
        })
      }
    },
  }
}
