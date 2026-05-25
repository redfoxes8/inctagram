"use client"

import { ChangePasswordPage } from "@/screens/change-password-page"
import { Container } from "@/shared/ui/Container"
import { Suspense } from "react"

export default function Page() {
  return (
    <main>
      <Container>
        <Suspense fallback={<div>Loading...</div>}>
          <ChangePasswordPage />
        </Suspense>
      </Container>
    </main>
  )
}
