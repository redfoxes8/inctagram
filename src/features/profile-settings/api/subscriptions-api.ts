import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@/shared/api/client"
import {
  CreateCheckoutArgs,
  PaymentsProductsResponse,
  GetSubscriptionsResponse,
  ToggleAutoRenewResponse,
  CheckoutStatusResponse,
} from "../types/type"

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

export const subscriptionsQueryKeys = {
  all: ["subscriptions"] as const,
  current: () => [...subscriptionsQueryKeys.all, "current"] as const,
  products: () => ["payments", "products"] as const,
  checkoutStatus: (sessionId: string | null) => ["checkout", "status", sessionId] as const,
}

export function usePaymentsProductsQuery() {
  return useQuery<PaymentsProductsResponse, Error>({
    queryKey: subscriptionsQueryKeys.products(),
    queryFn: async () => {
      const response = await client.GET("/api/v1/payments/products")
      if (response.error) throw response.error
      return response.data
    },
    staleTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  })
}

export function useCreateCheckoutSessionMutation() {
  return useMutation({
    mutationFn: async ({ productId, provider, autoRenewConsent }: CreateCheckoutArgs) => {
      const idempotencyKey = crypto.randomUUID()

      const response = await client.POST("/api/v1/payments/checkout", {
        params: {
          header: {
            "Idempotency-Key": idempotencyKey,
          },
        },
        body: {
          productId,
          provider,
          autoRenewConsent: true,
        },
      })

      if (response.error) {
        throw response.error
      }

      return response.data
    },
    onSuccess: (data) => {
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        console.error("Бэкенд ответил успехом (201), но не прислал URL для редиректа:", data)
      }
    },
    onError: (error) => {
      console.error("Критическая ошибка при создании сессии оплаты:", error)
    },
  })
}

export function useCurrentSubscriptionQuery() {
  return useQuery<GetSubscriptionsResponse, Error>({
    queryKey: subscriptionsQueryKeys.current(),
    queryFn: async () => {
      const response = await client.GET("/api/v1/payments/subscriptions")
      if (response.error) {
        throw new Error(
          "message" in response.error && typeof response.error.message === "string"
            ? response.error.message
            : "Failed to load subscription",
        )
      }
      return response.data
    },
  })
}

export function useToggleAutoRenewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ subscriptionId, enabled }: { subscriptionId: string; enabled: boolean }) => {
      const response = await client.PATCH("/api/v1/payments/subscriptions/{subscriptionId}/auto-renew", {
        params: { path: { subscriptionId } },
        body: { enabled },
      })
      if (response.error) {
        throw new Error(getToggleAutoRenewErrorMessage(response.response?.status))
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionsQueryKeys.current() })
    },
  })
}

export function useCheckoutStatusQuery(sessionId: string | null) {
  return useQuery<CheckoutStatusResponse, Error>({
    queryKey: subscriptionsQueryKeys.checkoutStatus(sessionId),
    queryFn: async () => {
      if (!sessionId) throw new Error("Session ID is required")

      const response = await client.GET("/api/v1/payments/checkout/{checkoutSessionId}/status", {
        params: {
          path: { checkoutSessionId: sessionId },
        },
      })

      if (response.error) throw response.error
      return response.data
    },
    enabled: !!sessionId,
    retry: 3,
    retryDelay: 2000,
  })
}
