import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@/shared/api/client"
import type { GetNotificationsResponse, MarkSeenResponse, UnseenCountResponse } from "../model/types"

export const notificationsQueryKeys = {
  all: ["notifications"] as const,
  history: () => [...notificationsQueryKeys.all, "history"] as const,
  unseenCount: () => [...notificationsQueryKeys.all, "unseen-count"] as const,
}

export function useNotificationsHistoryQuery() {
  return useInfiniteQuery<GetNotificationsResponse, Error>({
    queryKey: notificationsQueryKeys.history(),
    queryFn: async ({ pageParam }) => {
      const response = await client.GET("/api/v1/notifications", {
        params: {
          query: {
            cursor: pageParam as string | undefined,
            pageSize: 20,
          },
        },
      })
      if (response.error) throw response.error
      return response.data
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 0,
    refetchOnMount: true,
  })
}

export function useUnseenCountQuery() {
  return useQuery<UnseenCountResponse, Error>({
    queryKey: notificationsQueryKeys.unseenCount(),
    queryFn: async () => {
      const response = await client.GET("/api/v1/notifications/unseen-count")
      if (response.error) throw response.error
      return response.data
    },
    staleTime: 0,
    refetchOnMount: "always",
  })
}

export function useMarkSeenMutation() {
  const queryClient = useQueryClient()
  return useMutation<MarkSeenResponse, Error>({
    mutationFn: async () => {
      const response = await client.PATCH("/api/v1/notifications/seen")
      if (response.error) throw response.error
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(notificationsQueryKeys.unseenCount(), {
        unseenCount: data.unseenCount,
      })
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.history() })
    },
  })
}
