import { LoginForm } from "@/features/auth/login-flow"
import s from "./page.module.css"

export default function SuperadminSignInPage() {
  return (
    <main className={s.main}>
      <LoginForm variant="superadmin" />
    </main>
  )
}
