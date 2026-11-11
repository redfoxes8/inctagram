"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import type { ApolloClient } from "@apollo/client"
import { useApolloClient } from "@apollo/client/react"
import { useRouter } from "next/navigation"
import { isSuperadminSessionUnauthenticated, restoreSuperadminSession } from "@/features/auth/api/superadmin-session"

type Result = { client: ApolloClient; status: "ready" | "error" | "unauthenticated" }

export function SuperadminSessionBoundary({ children }: { children: ReactNode }) {
  const client = useApolloClient()
  const router = useRouter()
  const [result, setResult] = useState<Result | null>(null)
  const attempt = useRef<{ client: ApolloClient; promise: Promise<void> } | null>(null)

  useEffect(() => {
    let active = true
    // Keep the same promise across effect replay (Strict Mode) and rerenders.
    // A new protected-layout mount or a different client starts one new attempt.
    if (attempt.current?.client !== client) {
      attempt.current = { client, promise: restoreSuperadminSession(client) }
    }
    void attempt.current.promise.then(
      () => {
        if (active) setResult({ client, status: "ready" })
      },
      (error: unknown) => {
        if (!active) return
        if (isSuperadminSessionUnauthenticated(error)) {
          setResult({ client, status: "unauthenticated" })
          router.replace("/superadmin/sign-in")
        } else {
          setResult({ client, status: "error" })
        }
      },
    )
    return () => {
      active = false
    }
  }, [client, router])

  if (result?.client !== client) return <p role="status">Loading…</p>
  if (result.status === "unauthenticated") return <p role="status">Please sign in.</p>
  if (result.status === "error") {
    return <p role="alert">Unable to restore the admin session. Please reload the page to try again.</p>
  }
  return children
}
