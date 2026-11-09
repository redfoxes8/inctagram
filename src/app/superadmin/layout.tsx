"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { LanguageSwitcher } from "@/features/language-switcher"
import { SuperadminSidebar } from "@/widgets/superadmin-sidebar"
import s from "./layout.module.css"

export default function SuperadminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isSignIn = pathname === "/superadmin/sign-in" || pathname.startsWith("/superadmin/sign-in/")

  return (
    <div className={s.shell}>
      <header className={s.header}>
        <div className={s.headerContent}>
          <div className={s.brand}>
            Inctagram<span>SuperAdmin</span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>
      {isSignIn ? (
        children
      ) : (
        <div className={s.content}>
          <SuperadminSidebar pathname={pathname} />
          {children}
        </div>
      )}
    </div>
  )
}
