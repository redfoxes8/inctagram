import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRef } from "react"
import { client } from "@/shared/api/client"
import { GetCheckoutSessionStatusResponseDtoStatus } from "@/shared/api/schema"
import {
  CheckoutStatusResponse,
  CreateCheckoutArgs,
  GetSubscriptionsResponse,
  PaymentsProductsResponse,
} from "../model/types"

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

const getCheckoutErrorMessage = (error: unknown) => {
  const status =
    typeof error === "object" && error !== null && "code" in error ? (error as { code?: number }).code : undefined
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? (error as { message?: string }).message
      : undefined

  if (message === "PROVIDER_NOT_SUPPORTED") {
    return "PayPal is not available yet. Please use Stripe."
  }

  if (message === "checkout_not_active_session" || message?.toLowerCase().includes("no longer active")) {
    return "Your previous checkout session has expired. Please start a new purchase."
  }

  switch (status) {
    case 400:
      return "Payment provider rejected the request. Please try again."
    case 401:
      return "You are not authorized. Please log in again."
    case 404:
      return "Selected product was not found."
    case 409:
      return "This checkout conflicts with an existing subscription. Please refresh the page."
    case 503:
      return "Payment service is temporarily unavailable. Please try again later."
    case 504:
      return "Payment service timed out. Please try again later."
    default:
      return "Transaction failed, please try again."
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
  const idempotencyKeyRef = useRef<string | null>(null)

  const mutation = useMutation({
    mutationFn: async ({ productId, provider, autoRenewConsent }: CreateCheckoutArgs) => {
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = crypto.randomUUID()
      }

      const response = await client.POST("/api/v1/payments/checkout", {
        params: {
          header: {
            "Idempotency-Key": idempotencyKeyRef.current,
          },
        },
        body: {
          productId,
          provider,
          autoRenewConsent: autoRenewConsent as true,
        },
      })

      if (response.error) {
        throw new Error(getCheckoutErrorMessage(response.error))
      }
      return response.data
    },
    onSuccess: (data) => {
      idempotencyKeyRef.current = null
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    },
    onError: () => {
      idempotencyKeyRef.current = null
    },
  })

  const resetIdempotencyKey = () => {
    idempotencyKeyRef.current = null
  }

  return { ...mutation, resetIdempotencyKey }
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
      queryClient.invalidateQueries({ queryKey: ["me"] })
    },
  })
}

export function useCheckoutStatusQuery(sessionId: string | null) {
  return useQuery<CheckoutStatusResponse, Error>({
    queryKey: subscriptionsQueryKeys.checkoutStatus(sessionId),
    queryFn: async () => {
      if (!sessionId) throw new Error("Session ID is required")

      const response = await client.GET("/api/v1/payments/checkout/stripe/{providerCheckoutId}/status", {
        params: {
          path: { providerCheckoutId: sessionId },
        },
      })

      if (response.error) throw response.error
      return response.data
    },
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (!status) return 2000
      if (status === GetCheckoutSessionStatusResponseDtoStatus.CREATED) return 2000
      return false
    },
    refetchIntervalInBackground: false,
  })
}
