"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AUTH_PAGES, PAGES, PROTECTED_PAGES } from "@/shared/config/pages.config"
import { MeResponse } from "@/features/auth/types"

export function useAuthRedirect(user: MeResponse | null | undefined, isLoading: boolean) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isLoading) return

    const isProfilePage = pathname.startsWith("/profile")
    const isSettingsPage = pathname.startsWith("/settings")
    const isAuthPage = AUTH_PAGES.includes(pathname)

    const isProtectedPage = (PROTECTED_PAGES.includes(pathname) || isSettingsPage) && !isProfilePage

    if (user) {
      if (isAuthPage) {
        router.replace(PAGES.TO_PROFILE(`${user.userId}`))
        return
      }

      if (pathname === "/settings") {
        router.replace(PAGES.SETTINGS())
        return
      }
    } else {
      if (isProtectedPage) {
        router.replace(PAGES.LOGIN)
        return
      }
    }

    setMounted(true)
  }, [isLoading, user, pathname, router])

  return { mounted }
}
