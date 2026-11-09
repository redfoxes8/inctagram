"use client"

import { gql, type TypedDocumentNode } from "@apollo/client"
import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { useQuery } from "@apollo/client/react"
import type { UsersInput, UsersPage } from "@/features/superadmin-users/model/types"

export const USERS_QUERY: TypedDocumentNode<{ superadminUsers: UsersPage }, { input: UsersInput }> = gql`
  query SuperadminUsersList($input: SuperadminUsersInput!) {
    superadminUsers(input: $input) {
      items {
        userId
        username
        profileUrl
        createdAt
        state
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

export function getUsersErrorMessage(error: unknown): string {
  if (CombinedGraphQLErrors.is(error)) {
    const codes = error.errors.map((item) => item.extensions?.code)
    if (codes.includes("UNAUTHENTICATED")) return "Your admin session has expired. Please sign in again."
    if (codes.includes("FORBIDDEN"))
      return "Access denied. Check the admin session, allowed origin and CSRF configuration."
    if (codes.includes("BAD_USER_INPUT")) return "The server rejected the request parameters."
    if (codes.includes("TOO_MANY_REQUESTS")) return "Too many requests. Please try again later."
    if (codes.includes("GRAPHQL_VALIDATION_FAILED"))
      return "This Gateway does not support the documented users contract."
  }
  return "Unable to complete the request. Check the connection and try refreshing the list."
}

export function useSuperadminUsers(input: UsersInput) {
  return useQuery(USERS_QUERY, {
    variables: { input },
    ssr: false,
    fetchPolicy: "no-cache",
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  })
}
