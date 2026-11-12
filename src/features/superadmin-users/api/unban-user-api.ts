"use client"

import { gql, type ApolloClient, type TypedDocumentNode } from "@apollo/client"
import { useApolloClient } from "@apollo/client/react"

type UnbanOutcome = "UNBLOCKED" | "ALREADY_ACTIVE" | "NOT_FOUND" | "USER_DELETED"
type UnbanPayload = { userId: string; outcome: UnbanOutcome }

export const UNBAN_USER: TypedDocumentNode<{ superadminUnblockUser: UnbanPayload }, { input: { userId: string } }> =
  gql`
    mutation SuperadminUnbanUser($input: SuperadminUserIdInput!) {
      superadminUnblockUser(input: $input) {
        userId
        outcome
      }
    }
  `

export async function unbanSuperadminUser(client: ApolloClient, userId: string): Promise<UnbanPayload> {
  const response = await client.mutate({
    mutation: UNBAN_USER,
    variables: { input: { userId } },
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  })
  if (response.error) throw response.error
  const result = response.data?.superadminUnblockUser
  if (
    !result ||
    result.userId !== userId ||
    !["UNBLOCKED", "ALREADY_ACTIVE", "NOT_FOUND", "USER_DELETED"].includes(result.outcome)
  ) {
    throw new Error("Un-ban result not confirmed")
  }
  return result
}

export function useUnbanSuperadminUser() {
  const client = useApolloClient()
  return (userId: string) => unbanSuperadminUser(client, userId)
}
