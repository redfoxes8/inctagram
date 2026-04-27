import { Icon } from "@/shared/ui/Icon"
import { LanguageSwitcher } from "@/features/language-switcher"
import { Container } from "@/shared/ui/Container"
import { FlexWrapper } from "@/shared/ui/FlexWrapper"
import { Logo } from "@/shared/ui/Logo"

import s from "./Header.module.css"

export const Header = () => {
  return (
    <header className={s.header}>
      <Container>
        <FlexWrapper justify={"space-between"} align={"center"}>
          <Logo />
          <div className={s.controls}>
            <LanguageSwitcher />

            {/*<span className={s.menuIcon} aria-hidden="true">*/}
            {/*  <Icon className={s.menuSvg} name="more-horizontal-outline" />*/}
            {/*</span>*/}
          </div>
        </FlexWrapper>
      </Container>
    </header>
  )
}
