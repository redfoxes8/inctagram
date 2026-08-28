"use client"

import { useQuery } from "@tanstack/react-query"

import { client } from "@/shared/api/client"
import type { SchemaGetPaymentHistoryResponseDto } from "@/shared/api/schema"

const PAYMENTS_HISTORY_QUERY_KEY = "payments-history"

export type PaymentsHistoryResponse = SchemaGetPaymentHistoryResponseDto

type PaymentsHistoryParams = {
  pageNumber: number
  pageSize: number
}

const getPaymentsHistory = async ({
  pageNumber,
  pageSize,
}: PaymentsHistoryParams): Promise<PaymentsHistoryResponse> => {
  const { data, error } = await client.GET("/api/v1/payments/history", {
    params: {
      query: {
        pageNumber,
        pageSize,
      },
    },
  })

  if (error || !data) {
    throw new Error("Unable to load payment history")
  }

  return data
}

export const usePaymentsHistoryQuery = (params: PaymentsHistoryParams) => {
  return useQuery<PaymentsHistoryResponse, Error>({
    queryKey: [PAYMENTS_HISTORY_QUERY_KEY, params],
    queryFn: () => getPaymentsHistory(params),
  })
}
