"use client"

import { useMeQuery } from "@/features/auth/api/use-me"
import { useAuthRedirect } from "@/features/auth/lib/use-auth-redirect"
import { Suspense } from "react"

const AuthRedirectHandler = () => {
  const { data: user, isLoading } = useMeQuery()
  useAuthRedirect(user, isLoading)
  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <AuthRedirectHandler />
      </Suspense>
      {children}
    </>
  )
}
