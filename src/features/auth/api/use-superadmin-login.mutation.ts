"use client"

import { gql, type TypedDocumentNode } from "@apollo/client"
import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { useMutation } from "@apollo/client/react"
import { useRef } from "react"

type LoginInput = { email: string; password: string }
type LoginData = { superadminLogin: { authenticated: boolean } }
type LoginVariables = { input: LoginInput }

const SUPERADMIN_LOGIN: TypedDocumentNode<LoginData, LoginVariables> = gql`
  mutation SuperadminLogin($input: SuperadminLoginInput!) {
    superadminLogin(input: $input) {
      authenticated
    }
  }
`

export function getSuperadminLoginErrorMessage(error: unknown): string {
  if (CombinedGraphQLErrors.is(error)) {
    const codes = error.errors.map((item) => item.extensions?.code)
    if (codes.includes("UNAUTHENTICATED")) return "Incorrect email or password"
    if (codes.includes("TOO_MANY_REQUESTS")) return "Too many attempts. Please try again later."
    if (codes.includes("FORBIDDEN")) return "Access denied. Check the Gateway origin configuration."
  }
  return "Unable to sign in. Please check the connection and Gateway configuration."
}

export function useSuperadminLoginMutation() {
  const [mutate, { loading }] = useMutation(SUPERADMIN_LOGIN, {
    errorPolicy: "all",
    fetchPolicy: "no-cache",
  })
  const inFlight = useRef(false)

  const login = async (input: LoginInput) => {
    if (inFlight.current) throw new Error("Sign in is already in progress")
    inFlight.current = true
    try {
      const result = await mutate({ variables: { input } })
      if (result.error) throw result.error
      if (result.data?.superadminLogin?.authenticated !== true) {
        throw new Error("Gateway did not confirm authentication")
      }
    } finally {
      inFlight.current = false
    }
  }

  return { login, isPending: loading }
}
