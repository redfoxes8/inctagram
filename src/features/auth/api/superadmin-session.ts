"use client"

import { gql, type ApolloClient, type TypedDocumentNode } from "@apollo/client"
import { CombinedGraphQLErrors } from "@apollo/client/errors"

export const SUPERADMIN_SESSION: TypedDocumentNode<{ superadminSession: { authenticated: boolean } }> = gql`
  query RestoreSuperadminSession {
    superadminSession {
      authenticated
    }
  }
`

export async function restoreSuperadminSession(client: ApolloClient): Promise<void> {
  // The existing transport captures X-Superadmin-CSRF before this query resolves.
  const response = await client.query({ query: SUPERADMIN_SESSION, fetchPolicy: "no-cache", errorPolicy: "all" })
  if (response.error) throw response.error
  if (response.data?.superadminSession?.authenticated !== true) {
    throw new Error("Admin session not confirmed")
  }
}

export function isSuperadminSessionUnauthenticated(error: unknown): boolean {
  return CombinedGraphQLErrors.is(error) && error.errors.some((item) => item.extensions?.code === "UNAUTHENTICATED")
}
