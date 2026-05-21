"use client"

import clsx from "clsx"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"

import s from "./ForgotPasswordForm.module.css"

import { useForgotPasswordMutation } from "@/features/auth/api/use-password-recovery.mutation"
import { SchemaPasswordRecoveryDto } from "@/shared/api/schema"
import { Button, Input, Modal, Recaptcha } from "@/shared/ui"

const EMAIL_VALIDATION_ERROR = "Email must be a valid email address"

export function ForgotPasswordForm() {
  const [recaptchaToken, setRecaptchaToken] = useState("")
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const { mutateAsync: passwordRecoveryMutation, isPending, error } = useForgotPasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<SchemaPasswordRecoveryDto>({
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  })

  const isFormValid = isValid && !!recaptchaToken

  const onSubmitForm = async (data: SchemaPasswordRecoveryDto) => {
    await passwordRecoveryMutation({
      email: data.email,
      recaptchaToken,
    })

    setSubmittedEmail(data.email)
    setIsOpen(true)

    reset()
    setRecaptchaToken("")
  }

  const errorMessage = error instanceof Error ? error.message || EMAIL_VALIDATION_ERROR : null

  return (
    <main className={s.wrapper}>
      <div className={s.content}>
        <span className="h1">Forgot Password </span>

        <form onSubmit={handleSubmit(onSubmitForm)} className={s.form}>
          <Input
            label="Email"
            type="email"
            placeholder="example@mail.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email format",
              },
            })}
            error={errors.email?.message}
          />

          {errorMessage && <p className={s.errorMessage}> {errorMessage}</p>}

          <p className={clsx("regular_text_14", s.info_text)}>
            Enter your email address and we will send you further instructions{" "}
          </p>

          <div className={s.button_group}>
            <Button type="submit" variant="primary" disabled={!isFormValid || isPending}>
              {isPending ? "Sending..." : "Send Link"}
            </Button>

            <Button asChild variant="outlined" className={s.outlined_button_back}>
              <Link href="/login">Back to Sign In </Link>
            </Button>
          </div>

          <div className={s.recaptcha}>
            <Recaptcha
              onVerify={(token) => {
                setRecaptchaToken(token)
              }}
            />
          </div>
        </form>

        {isOpen && (
          <>
            <p className={clsx("regular_text_14", s.link_info)}>
              If an account with this email exists, a recovery link has been sent.
            </p>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Email sent" confirmText="OK">
              <>
                <span className="regular_text_16">We have sent a link to confirm your email to:</span>
                <span className={"regular_text_16"}> {submittedEmail} </span>
              </>
            </Modal>
          </>
        )}
      </div>
    </main>
  )
}
