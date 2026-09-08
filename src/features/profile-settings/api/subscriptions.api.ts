import { useMutation, useQuery } from "@tanstack/react-query"
import { client } from "@/shared/api/client"
import { CreateCheckoutArgs, PaymentsProductsResponse } from "../types/type"

export function usePaymentsProductsQuery() {
  return useQuery<PaymentsProductsResponse, Error>({
    queryKey: ["payments", "products"],
    queryFn: async () => {
      const response = await client.GET("/api/v1/payments/products")

      if (response.error) {
        throw response.error
      }

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
