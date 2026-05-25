import { ConfirmEmailPage } from "@/screens/confirm-email-page"
import { Suspense } from "react"

export default function ConfirmEmail() {
  return (
    <main style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Suspense fallback={<div>Loading...</div>}>
        <ConfirmEmailPage />
      </Suspense>
    </main>
  )
}
