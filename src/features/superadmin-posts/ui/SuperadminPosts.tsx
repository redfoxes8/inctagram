"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useApolloClient } from "@apollo/client/react"
import Link from "next/link"
import { Button } from "@/shared/ui/Button"
import { Input } from "@/shared/ui/Input"
import { Icon } from "@/shared/ui/Icon"
import { createPostsFeed, initialFeedState, type FeedState } from "@/features/superadmin-posts/model/posts-feed"
import type { SuperadminPost } from "@/features/superadmin-posts/model/types"
import s from "./SuperadminPosts.module.css"

type Props = { onBan: (post: SuperadminPost) => void; banPending: boolean }

export function SuperadminPosts(props: Props) {
  const [draft, setDraft] = useState("")
  const [search, setSearch] = useState("")
  const applySearch = () => setSearch(draft.trim())
  return (
    <main className={s.main}>
      <h1 className={s.srOnly}>Posts list</h1>
      <form
        role="search"
        className={s.search}
        onSubmit={(event) => {
          event.preventDefault()
          applySearch()
        }}
      >
        <Input
          aria-label="Search posts by username"
          placeholder="Search"
          value={draft}
          maxLength={100}
          onChange={(event) => setDraft(event.target.value)}
          className={s.searchInput}
          leftIcon={<Icon name="search-outline" />}
          onLeftIconClick={applySearch}
        />
        <Button type="submit" variant="outlined">
          Search
        </Button>
      </form>
      <PostsFeed key={search} search={search} {...props} />
    </main>
  )
}

function PostsFeed({ search, onBan, banPending }: Props & { search: string }) {
  const client = useApolloClient()
  const [state, setState] = useState<FeedState>(initialFeedState)
  const feed = useMemo(() => createPostsFeed(client, setState), [client])
  const sentinel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    feed.start(search)
    return () => feed.stop()
  }, [feed, search])
  useEffect(() => {
    if (
      !sentinel.current ||
      state.status !== "ready" ||
      state.loadingMore ||
      state.error ||
      !state.pageInfo?.hasNextPage ||
      typeof IntersectionObserver === "undefined"
    )
      return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void feed.loadMore()
      },
      { rootMargin: "240px" },
    )
    observer.observe(sentinel.current)
    return () => observer.disconnect()
  }, [feed, state.status, state.loadingMore, state.error, state.pageInfo])

  return (
    <>
      {state.status === "loading" && <p role="status">Loading posts…</p>}
      {state.connectionStatus === "connecting" && <p role="status">Connecting live updates…</p>}
      {state.connectionError && (
        <div className={s.message}>
          <p role={state.connectionStatus === "reconnecting" ? "status" : "alert"}>{state.connectionError}</p>
          {state.connectionStatus === "login" ? (
            <Link href="/superadmin/sign-in" prefetch={false} className="regular_link">
              Sign In
            </Link>
          ) : (
            <Button variant="outlined" onClick={() => feed.retryConnection()}>
              Retry live updates
            </Button>
          )}
        </div>
      )}
      {state.status === "ready" && state.items.length === 0 && <p role="status">No posts found.</p>}
      {state.items.length > 0 && (
        <div className={s.grid} aria-label="Posts">
          {state.items.map((post) => (
            <PostCard key={post.postId} post={post} onBan={onBan} banPending={banPending} />
          ))}
        </div>
      )}
      {state.error && (
        <div className={s.message}>
          <p role="alert">{state.error}</p>
          {state.status === "login" ? (
            <Link href="/superadmin/sign-in" prefetch={false} className="regular_link">
              Sign In
            </Link>
          ) : (
            <Button
              variant="outlined"
              onClick={() => (state.retryTarget === "page" ? void feed.loadMore() : void feed.retryHead())}
            >
              Retry
            </Button>
          )}
        </div>
      )}
      {state.status === "ready" && state.pageInfo?.hasNextPage && (
        <div ref={sentinel} className={s.more}>
          <Button variant="outlined" disabled={state.loadingMore} onClick={() => void feed.loadMore()}>
            {state.loadingMore ? "Loading posts…" : "Load more"}
          </Button>
        </div>
      )}
      {state.loadingMore && <p role="status">Loading more posts…</p>}
    </>
  )
}

export function PostCard({ post, onBan, banPending }: Props & { post: SuperadminPost }) {
  const [imageIndex, setImageIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const image = post.images[imageIndex]
  const url = image?.url
  const label = post.username ?? "Unavailable"
  return (
    <article className={s.card}>
      <div className={s.photo}>
        {url && failedImage !== url ? (
          // Backend file URLs may use deployment-specific hosts; avoid the Next image proxy.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={`Photo ${imageIndex + 1} from ${label}'s post`}
            loading="lazy"
            onError={() => setFailedImage(url)}
          />
        ) : (
          <span className={s.unavailable}>
            <Icon name="image-outline" />
            Photo unavailable
          </span>
        )}
        {post.images.length > 1 && (
          <div className={s.imageControls}>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => setImageIndex((imageIndex + post.images.length - 1) % post.images.length)}
            >
              ‹
            </button>
            <span>
              {imageIndex + 1} / {post.images.length}
            </span>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => setImageIndex((imageIndex + 1) % post.images.length)}
            >
              ›
            </button>
          </div>
        )}
      </div>
      <div className={s.author}>
        <strong title={post.username ?? post.userId}>{label}</strong>
        <Button
          variant="ghost"
          className={s.ban}
          aria-label={`Ban ${post.username ?? post.userId}`}
          disabled={banPending}
          onClick={() => onBan(post)}
        >
          <Icon name="Block" />
        </Button>
      </div>
      <time className={s.date} dateTime={post.publishedAt}>
        {new Intl.DateTimeFormat("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "UTC",
        }).format(new Date(post.publishedAt))}{" "}
        UTC
      </time>
      <p className={expanded ? s.description : s.preview}>
        {expanded || post.description.length <= 120 ? post.description : `${post.description.slice(0, 120)}…`}
      </p>
      {post.description.length > 120 && (
        <button type="button" className={s.expand} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </article>
  )
}
