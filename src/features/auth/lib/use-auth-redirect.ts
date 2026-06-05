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

    const isProtectedPage = (PROTECTED_PAGES as readonly string[]).includes(pathname)
    const isAuthPage = AUTH_PAGES.includes(pathname)

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

    setMounted(true) // это самый рабочий и простой способ, хоть плоховатый
  }, [isLoading, user, pathname, router])

  return { mounted }
}
