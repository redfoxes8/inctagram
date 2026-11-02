import type { ReactNode } from "react"
import { LanguageSwitcher } from "@/features/language-switcher"
import s from "./layout.module.css"

export default function SuperadminLayout({ children }: { children: ReactNode }) {
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
      {children}
    </div>
  )
}
