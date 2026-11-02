"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { AuthProvider } from "@/features/auth/lib/auth-provider"
import { NotificationsProvider } from "@/features/notifications"
import { Header } from "@/widgets/header"

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/superadmin" || pathname.startsWith("/superadmin/")) return children

  return (
    <AuthProvider>
      <NotificationsProvider>
        <Header />
        {children}
      </NotificationsProvider>
    </AuthProvider>
  )
}
