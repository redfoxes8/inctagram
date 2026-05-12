import { Container } from "@/shared/ui/Container"
import s from "./RegisterPage.module.css"

import { RegistrationForm } from "@/features/auth/registration-flow"

type Props = {}

export function RegisterPage({}: Props) {
  return (
    <Container>
      <div className={s.content}>
        <RegistrationForm />
      </div>
    </Container>
  )
}
