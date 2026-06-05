"use client"

import { useCallback, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AUTH_PAGES, PAGES, PROTECTED_PAGES } from "@/shared/config/pages.config"
import { Sidebar } from "@/shared/ui"
import { useMeQuery } from "@/features/auth/api/use-me"
import { useLogoutMutation } from "@/features/auth/api/use-logout.mutation"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const isProtectedPage = (PROTECTED_PAGES as readonly string[]).includes(pathname)
  const isAuthPage = AUTH_PAGES.includes(pathname)

  const { data: user, isLoading } = useMeQuery()
  const { mutate: logout } = useLogoutMutation()

  const showSidebar = !!user

  const handleLogout = useCallback(() => {
    logout(undefined, {
      onSuccess: () => router.replace(PAGES.LOGIN),
      onError: (error) => console.error("Failed to logout:", error),
    })
  }, [logout, router])

  useEffect(() => {
    if (isLoading) return

    if (user) {
      if (pathname === PAGES.PROFILE || isAuthPage) {
        router.replace(PAGES.TO_PROFILE(`${user.userId}`))
        return
      }
    } else {
      if (pathname === PAGES.PROFILE) {
        router.replace(PAGES.HOME)
        return
      }
      if (isProtectedPage) {
        router.replace(PAGES.LOGIN)
        return
      }
    }
  }, [isLoading, user, pathname, router])

  if (isLoading) return null

  return (
    <div style={{ display: "flex" }}>
      {showSidebar && <Sidebar onLogout={handleLogout} />}
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  )
}
