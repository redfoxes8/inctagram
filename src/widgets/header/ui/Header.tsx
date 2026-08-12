"use client"

import { LanguageSwitcher } from "@/features/language-switcher"
import { Container } from "@/shared/ui/Container"
import { FlexWrapper } from "@/shared/ui/FlexWrapper"
import { Logo } from "@/shared/ui/Logo"

import s from "./Header.module.css"
import { useMeQuery } from "@/features/auth/api/use-me"
import { PAGES } from "@/shared/config/pages.config"
import { Button } from "@/shared/ui"
import { usePathname, useRouter } from "next/navigation"

export const Header = () => {
  const { data: user, isLoading } = useMeQuery()
  const router = useRouter()
  const pathname = usePathname()
  const isPrivacyPolicyPage = pathname === PAGES.PRIVACY_POLICY

  return (
    <header className={s.header}>
      <Container className={s.headerContainer}>
        <FlexWrapper justify={"space-between"} align={"center"}>
          <Logo />
          <div className={s.controls}>
            <LanguageSwitcher />

            {!isLoading && !user && !isPrivacyPolicyPage && (
              <div className={s.btn_group}>
                <Button variant="outlined" onClick={() => router.push("/login")}>
                  Login
                </Button>
                <Button onClick={() => router.push("/register")}>Sign In</Button>
              </div>
            )}
          </div>
        </FlexWrapper>
      </Container>
    </header>
  )
}
