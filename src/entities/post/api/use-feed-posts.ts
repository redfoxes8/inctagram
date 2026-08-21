"use client"

import { client } from "@/shared/api/client"
import { useInfiniteQuery } from "@tanstack/react-query"
import { toast } from "sonner"

type UseFeedPostsParams = {
  pageSize?: number
  enabled?: boolean
  userId: string
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

export function useFeedPosts({ pageSize = 8, enabled = true, userId }: UseFeedPostsParams) {
  return useInfiniteQuery({
    queryKey: ["posts", { userId, pageSize }],
    queryFn: async ({ pageParam }) => {
      const commonQuery = {
        cursor: pageParam as string | undefined,
        pageSize,
      }

      const res = await client.GET("/api/v1/users/{userId}/posts", {
        params: {
          path: { userId },
          query: commonQuery,
        },
      })

      if (res.error) {
        handleFeedError(res.response?.status)
      }

      return {
        posts: res.data?.posts ?? [],
        nextCursor: res.data?.nextCursor ?? null,
        hasMore: res.data?.hasMore ?? false,
      }
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore && lastPage.nextCursor) {
        return lastPage.nextCursor
      }
      return undefined
    },
    enabled: enabled && Boolean(userId),
    staleTime: 60 * 1000,
  })
}
