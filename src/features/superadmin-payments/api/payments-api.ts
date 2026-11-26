"use client"

import { gql, type TypedDocumentNode } from "@apollo/client"
import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { useQuery } from "@apollo/client/react"
import type { PaymentsInput, PaymentsPage } from "@/features/superadmin-payments/model/types"

export const PAYMENTS_QUERY: TypedDocumentNode<{ superadminPayments: PaymentsPage | null }, { input: PaymentsInput }> =
  gql`
    query SuperadminPaymentsList($input: SuperadminPaymentsInput!) {
      superadminPayments(input: $input) {
        items {
          transactionId
          userId
          username
          avatarUrl
          createdAt
          amountMinor
          currency
          productName
          billingInterval
          billingIntervalCount
          provider
          status
        }
        totalCount
        pageInfo {
          page
          pageSize
          pagesCount
          hasNextPage
        }
      }
    }
  `

export function useSuperadminPayments(input: PaymentsInput) {
  return useQuery(PAYMENTS_QUERY, {
    variables: { input },
    ssr: false,
    fetchPolicy: "no-cache",
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  })
}

export function getPaymentsErrorMessage(error: unknown): string {
  if (CombinedGraphQLErrors.is(error)) {
    const codes = error.errors.map((item) => item.extensions?.code)
    if (codes.includes("UNAUTHENTICATED")) return "Your admin session has expired. Please sign in again."
    if (codes.includes("UPSTREAM_UNAVAILABLE")) return "Payments are temporarily unavailable. Please try again."
    if (codes.includes("FORBIDDEN")) return "Access denied. Please check your admin session."
    if (codes.includes("BAD_USER_INPUT")) return "The server rejected the request parameters."
    if (codes.includes("GRAPHQL_VALIDATION_FAILED"))
      return "This Gateway does not support the documented payments list."
  }
  return "Unable to load payments. Please try again."
}
