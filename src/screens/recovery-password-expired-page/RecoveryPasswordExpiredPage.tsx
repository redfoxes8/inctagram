"use client"

import { useState } from "react"
import Image from "next/image"
import clsx from "clsx"
import s from "./RecoveryPasswordExpiredPage.module.css"
import { Button, Container, FlexWrapper, Modal, Recaptcha } from "@/shared/ui"
import { useForgotPasswordMutation } from "@/features/auth/api/use-password-recovery.mutation"
import { localStorageKeys } from "@/features/auth/api/auth.type"

export const RecoveryPasswordExpiredPage = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState("")

  const email = localStorage.getItem(localStorageKeys.recoveryEmail) || ""

  const { mutateAsync: passwordRecoveryMutation, isPending, error } = useForgotPasswordMutation()

  const handleResendLink = async () => {
    if (!email || !recaptchaToken) return

    try {
      await passwordRecoveryMutation({ email, recaptchaToken })
      setIsOpen(true)
    } catch {
      // handled by react-query
    }
  }

  const errorMessage = error instanceof Error ? error.message : null

  return (
    <main>
      <Container>
        <FlexWrapper direction={"column"} align={"center"}>
          <div className={s.content}>
            <h1 className={clsx(s.title, "h1")}>Email verification link expired </h1>

            <p className={clsx("regular_text_16", s.description)}>
              Looks like the verification link has expired. Not to worry, we can send the link again
            </p>

            <Button
              className={s.button}
              variant="primary"
              onClick={handleResendLink}
              disabled={!recaptchaToken || isPending}
            >
              {isPending ? "Sending..." : "Resend Link"}
            </Button>

            <div className={s.recaptcha}>
              <Recaptcha
                onVerify={(token) => {
                  setRecaptchaToken(token)
                }}
              />
            </div>
          </div>

          <Image src="/rafiki_web.png" alt="Expired link" width={440} height={350} className={s.rafiki_img} priority />

          {errorMessage && <p className={s.error}> {errorMessage} </p>}

          {isOpen && (
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Email sent" confirmText="OK">
              <>
                <span className="regular_text_16">We have sent a link to confirm your email to:</span>
                <span className="regular_text_16"> {email} </span>
              </>
            </Modal>
          )}
        </FlexWrapper>
      </Container>
    </main>
  )
}
