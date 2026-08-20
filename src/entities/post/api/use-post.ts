"use client"

import { useQuery } from "@tanstack/react-query"
import { client } from "@/shared/api/client"
import { PostItem } from "@/entities/post/model/post.types"

export const getPostQueryKey = (postId?: string | null) => ["post", postId] as const

type UsePostQueryOptions = {
  enabled?: boolean
  initialData?: PostItem
}

export function usePostQuery(postId?: string | null, options?: UsePostQueryOptions) {
  return useQuery<PostItem, Error>({
    queryKey: getPostQueryKey(postId),
    queryFn: async () => {
      if (!postId) throw new Error("Post id is required")

      const res = await client.GET("/api/v1/posts/{postId}", {
        params: { path: { postId } },
      })

      if (res.error || !res.data) {
        throw new Error("Failed to fetch post")
      }

      return res.data as PostItem
    },
    enabled: Boolean(postId) && (options?.enabled ?? true),
    initialData: options?.initialData,
    staleTime: 60 * 1000,
  })
}
