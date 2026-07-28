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

    // Проверяем динамический роут профиля /profile/[userId]
    const isProfilePage = pathname.startsWith("/profile")
    const isSettingsPage = pathname.startsWith("/settings")
    const isProtectedPage = PROTECTED_PAGES.includes(pathname) || isSettingsPage
    const isAuthPage = AUTH_PAGES.includes(pathname)

    if (user) {
      // Если авторизован и зашел на страницу логина/регистрации — редиректим в его профиль
      if (isAuthPage) {
        router.replace(PAGES.TO_PROFILE(`${user.userId}`))
        return
      }
      if (isSettingsPage) {
        router.replace(PAGES.SETTINGS())
        return
      }
    } else {
      // Если НЕ авторизован и пытается зайти на защищенную страницу
      if (isProtectedPage) {
        router.replace(PAGES.LOGIN)
        return
      }
    }

    // Включаем mounted только если не произошло никаких редиректов
    setMounted(true)
  }, [isLoading, user, pathname, router])

  return { mounted }
}
