"use client"

import { useMeQuery } from "@/features/auth/api/use-me"
import { useAuthRedirect } from "@/features/auth/lib/use-auth-redirect"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useMeQuery()

  useAuthRedirect(user, isLoading)
  return <>{children}</>
}
