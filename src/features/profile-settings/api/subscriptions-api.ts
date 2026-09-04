import { client } from "@/shared/api/client"
import { GetSubscriptionsResponse, ToggleAutoRenewResponse } from "../types/type"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const getToggleAutoRenewErrorMessage = (status?: number) => {
  switch (status) {
    case 400:
      return "Unable to update auto-renewal. Please check your subscription and try again."

    case 401:
      return "You are not authorized. Please log in again."

    case 404:
      return "Subscription not found."

    case 409:
      return "Auto-renewal cannot be changed at this time. Please try again later."

    case 500:
      return "An internal payment error occurred. Please try again later."

    case 503:
      return "Payment service is temporarily unavailable. Please try again later."

    case 504:
      return "Payment service timed out. Please try again later."

    default:
      return "Failed to update auto-renewal. Please try again."
  }
}

const subscriptionsApi = {
  getCurrent: async (): Promise<GetSubscriptionsResponse> => {
    const { data, error } = await client.GET("/api/v1/payments/subscriptions")

    if (error) {
      throw new Error(
        "message" in error && typeof error.message === "string" ? error.message : "Failed to load subscription",
      )
    }

    return data
  },

  toggleAutoRenew: async (subscriptionId: string, enabled: boolean): Promise<ToggleAutoRenewResponse> => {
    const { data, error, response } = await client.PATCH("/api/v1/payments/subscriptions/{subscriptionId}/auto-renew", {
      params: {
        path: {
          subscriptionId,
        },
      },
      body: {
        enabled,
      },
    })

    if (error) {
      throw new Error(getToggleAutoRenewErrorMessage(response?.status))
    }

    return data
  },
}

export const subscriptionsQueryKeys = {
  all: ["subscriptions"] as const,

  current: () => [...subscriptionsQueryKeys.all, "current"] as const,
}

export const useCurrentSubscription = () => {
  return useQuery({
    queryKey: subscriptionsQueryKeys.current(),
    queryFn: subscriptionsApi.getCurrent,
  })
}

export const useToggleAutoRenew = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subscriptionId, enabled }: { subscriptionId: string; enabled: boolean }) =>
      subscriptionsApi.toggleAutoRenew(subscriptionId, enabled),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionsQueryKeys.current(),
      })
    },
  })
}
