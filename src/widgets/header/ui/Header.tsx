import { Icon } from "@/shared/ui/Icon"

import s from "./Header.module.css"
import { Container } from "@/shared/ui/Container/Container"
import { FlexWrapper } from "@/shared/ui/FlexWrapper"
import { Logo } from "@/shared/ui/Logo"

export const Header = () => {
  return (
    <header className={s.header}>
      <Container>
        <FlexWrapper justify={"space-between"} align={"center"}>
          <Logo />
          <div className={s.controls}>
            <div className={s.language} aria-label="Selected language">
              <span className={s.flag} aria-hidden="true" />
              <Icon className={s.chevron} name="arrow-ios-Down-outline" />
            </div>

            <span className={s.menuIcon} aria-hidden="true">
              <Icon className={s.menuSvg} name="more-horizontal-outline" />
            </span>
          </div>
        </FlexWrapper>
      </Container>
    </header>
  )
}
