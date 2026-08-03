"use client"

import { client } from "@/shared/api/client"
import { SchemaGetFeedResponseDto } from "@/shared/api/schema"
import { useInfiniteQuery } from "@tanstack/react-query"
import { toast } from "sonner"

type UseFeedPostsParams = {
  pageSize?: number
  enabled?: boolean
  userId?: string
  useFeedEndpoint?: boolean
}

function handleFeedError(status?: number): never {
  const errorMessage =
    status === 503
      ? "Post service unavailable. Please try again later."
      : status === 401
        ? "Unauthorized. Please log in again."
        : "Failed to fetch posts"

  toast.error(errorMessage)
  throw new Error(errorMessage)
}

export function useFeedPosts({
  pageSize = 8,
  enabled = true,
  userId,
  useFeedEndpoint = true,
}: UseFeedPostsParams = {}) {
  return useInfiniteQuery({
    queryKey: ["posts", { useFeedEndpoint, userId, pageSize }],
    queryFn: async ({ pageParam }) => {
      const endpoint = useFeedEndpoint ? "/api/v1/posts/feed" : "/api/v1/users/{userId}/posts"

      const res = await client.GET(endpoint as any, {
        params: {
          query: {
            cursor: pageParam as string | undefined,
            pageSize,
          },
          ...(!useFeedEndpoint && userId ? { path: { userId } } : {}),
        },
      })

      if (res.error) {
        handleFeedError(res.response?.status)
      }

      const data = res.data as SchemaGetFeedResponseDto

      return {
        posts: data.posts || [],
        nextCursor: data.nextCursor ?? null,
        hasMore: data.hasMore ?? false,
      }
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore && lastPage.nextCursor) {
        return lastPage.nextCursor
      }
      return undefined
    },
    enabled: enabled && (useFeedEndpoint || !!userId),
    staleTime: 60 * 1000,
  })
}
