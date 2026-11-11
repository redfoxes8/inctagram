"use client"

import { gql, type ApolloClient, type TypedDocumentNode } from "@apollo/client"
import { useApolloClient } from "@apollo/client/react"

type DeleteOutcome = "DELETED" | "ALREADY_DELETED" | "NOT_FOUND"
type DeletePayload = { userId: string; outcome: DeleteOutcome }

export const DELETE_USER: TypedDocumentNode<{ superadminDeleteUser: DeletePayload }, { input: { userId: string } }> =
  gql`
    mutation SuperadminDeleteUser($input: SuperadminUserIdInput!) {
      superadminDeleteUser(input: $input) {
        userId
        outcome
      }
    }
  `

export async function deleteSuperadminUser(client: ApolloClient, userId: string): Promise<DeletePayload> {
  const response = await client.mutate({
    mutation: DELETE_USER,
    variables: { input: { userId } },
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  })
  if (response.error) throw response.error
  const result = response.data?.superadminDeleteUser
  if (!result || result.userId !== userId || !["DELETED", "ALREADY_DELETED", "NOT_FOUND"].includes(result.outcome)) {
    throw new Error("Deletion result not confirmed")
  }
  return result
}

export function useDeleteSuperadminUser() {
  const client = useApolloClient()
  return (userId: string) => deleteSuperadminUser(client, userId)
}
