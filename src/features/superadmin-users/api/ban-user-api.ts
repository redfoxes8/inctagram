"use client"

import { gql, type ApolloClient, type TypedDocumentNode } from "@apollo/client"
import { useApolloClient } from "@apollo/client/react"
import { getBanReason, type BanReasonInput } from "@/features/superadmin-users/model/ban-user.types"

type BanOutcome = "BLOCKED" | "ALREADY_BLOCKED" | "NOT_FOUND" | "USER_DELETED"
type BanPayload = { userId: string; outcome: BanOutcome }

export const BAN_USER: TypedDocumentNode<
  { superadminBlockUser: BanPayload },
  { input: { userId: string }; reason: BanReasonInput }
> = gql`
  mutation SuperadminBanUser($input: SuperadminUserIdInput!, $reason: SuperadminBanReasonInput) {
    superadminBlockUser(input: $input, reason: $reason) {
      userId
      outcome
    }
  }
`

export async function banSuperadminUser(
  client: ApolloClient,
  userId: string,
  reason: BanReasonInput,
): Promise<BanPayload> {
  const validatedReason = getBanReason(reason.code, "text" in reason ? reason.text : "")
  const response = await client.mutate({
    mutation: BAN_USER,
    variables: { input: { userId }, reason: validatedReason },
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  })
  if (response.error) throw response.error
  const result = response.data?.superadminBlockUser
  if (
    !result ||
    result.userId !== userId ||
    !["BLOCKED", "ALREADY_BLOCKED", "NOT_FOUND", "USER_DELETED"].includes(result.outcome)
  ) {
    throw new Error("Ban result not confirmed")
  }
  return result
}

export function useBanSuperadminUser() {
  const client = useApolloClient()
  return (userId: string, reason: BanReasonInput) => banSuperadminUser(client, userId, reason)
}
