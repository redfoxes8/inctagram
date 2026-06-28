"use client"

import { useFeedPosts } from "@/entities/post/api/use-feed-posts"
import { Spinner } from "@radix-ui/themes"
import { useInfiniteScroll } from "@/shared/lib/hooks"
import { PostCard } from "@/entities/post/ui/post-card/PostCard"
import s from "./PostFeed.module.css"
import { SchemaPostResponseDto, SchemaUserMeResponseDto } from "@/shared/api/schema"

type PostFeedProps = {
  userId: string
  isOwner: boolean
  pageSize?: number
  onPostClick?: (postId: string) => void
  useFeedEndpoint?: boolean
}

export const PostFeed = ({ userId, isOwner, pageSize = 8, onPostClick, useFeedEndpoint = true }: PostFeedProps) => {
  const feedQuery = useFeedPosts({
    pageSize,
    // enabled: !!userId
  })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = feedQuery

  const { ref } = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    rootMargin: "0px 0px 30px 0px",
    threshold: 0.1,
  })

  const posts =
    data?.pages.flatMap((page) => {
      if (page.posts) return page.posts
      return []
    }) ?? []

  if (isLoading) {
    return <PostFeedSkeleton count={8} />
  }

  if (isError) {
    return (
      <div className={s.error}>
        <p className="h3">Failed to load posts</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className={s.empty}>
        <p className="h3">No publications yet</p>
      </div>
    )
  }

  return (
    <div className={s.feed}>
      <div className={s.gridContainer}>
        {posts.map((post: SchemaPostResponseDto) => (
          <PostCard key={post.id} post={post} isOwner={isOwner} onPostClick={onPostClick} />
        ))}
      </div>

      <div ref={ref} className={s.loadingTrigger}>
        {isFetchingNextPage && (
          <div className={s.loadingMore}>
            <Spinner size="1" />
            <span>Loading more posts...</span>
          </div>
        )}

        {!hasNextPage && !isFetchingNextPage && posts.length > 0 && (
          <p className={s.endMessage}>All publications loaded</p>
        )}
      </div>
    </div>
  )
}

function PostFeedSkeleton({ count }: { count: number }) {
  return (
    <div className={s.gridContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={s.skeleton} />
      ))}
    </div>
  )
}
