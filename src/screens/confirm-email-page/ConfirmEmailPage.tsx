"use client"

import { Container } from "@/shared/ui/Container"
import s from "./ConfirmEmailPage.module.css"
import Image from "next/image"
import { Button } from "@/shared/ui/Button"
import clsx from "clsx"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useConfirmEmail } from "@/features/auth/api/use-confirm-email"
import { PAGES } from "@/shared/config/pages.config"

export function ConfirmEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { mutate, isSuccess, isPending, isError } = useConfirmEmail()

  const code = searchParams.get("code")

  useEffect(() => {
    if (!code) {
      router.replace(PAGES.REGISTRATION)
      return
    }
    mutate(code)
  }, [code, mutate, router])

  useEffect(() => {
    if (isError) {
      router.replace(PAGES.VERIFICATION)
    }
  }, [isError, router])

  return (
    <Container>
      {isPending && <div>LOADER...</div>}

      {isSuccess && (
        <div className={s.content}>
          <span className={`h2`}>Congratulations!</span>
          <span className={clsx(`regular_text_16`, s.confirmed)}>Your email has been confirmed</span>

          <Button className={s.button} onClick={() => router.push(PAGES.LOGIN)}>
            Sign In
          </Button>

          <Image className={s.bro_img} src={"/bro.png"} alt="bro" width={330} height={230} loading="eager" />
          <Button className={s.button_mobileOnly} onClick={() => router.push(PAGES.LOGIN)}>
            Sign In
          </Button>
        </div>
      )}
    </Container>
  )
}
