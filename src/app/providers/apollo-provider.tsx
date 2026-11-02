"use client"

import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs"
import type { ReactNode } from "react"
import { makeApolloClient } from "@/shared/api/apollo/client"

export function ApolloProvider({ children }: { children: ReactNode }) {
  return <ApolloNextAppProvider makeClient={makeApolloClient}>{children}</ApolloNextAppProvider>
}
