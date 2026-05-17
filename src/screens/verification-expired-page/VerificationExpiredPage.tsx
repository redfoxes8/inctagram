"use client"

import { Container } from "@/shared/ui/Container"
import s from "./VerificationExpiredPage.module.css"
import Image from "next/image"
import { Button } from "@/shared/ui/Button"
import clsx from "clsx"
import { useForm } from "react-hook-form"
import { Input } from "@/shared/ui/Input"
import { ConfirmEmailError } from "@/features/auth/types/auth-api.types"
import { useConfirmEmail } from "@/features/auth/api/use-confirm-email"

type VerificationFormInputs = {
  email: string
}

export function VerificationExpiredPage() {
  const { mutate, isPending } = useConfirmEmail()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<VerificationFormInputs>({ mode: "all" })

  const onSubmit = (data: VerificationFormInputs) => {
    console.log(data)
    mutate(data.email, {
      onSuccess: () => {
        console.log("All fine")
      },
      onError: (error: any) => {
        const apiError = error as ConfirmEmailError

        if (apiError.errorsMessages) {
          apiError.errorsMessages.forEach((err) => {
            setError("email", {
              type: "server",
              message: err.message,
            })
          })
        } else {
          setError("email", {
            type: "server",
            message: apiError.message || "Something went wrong",
          })
        }
      },
    })
  }

  return (
    <Container>
      <form className={s.content} onSubmit={handleSubmit(onSubmit)}>
        <span className={`h2`}>Email verification link expired</span>
        <span className={clsx(`regular_text_16`, s.description)}>
          Looks like the verification link has expired. Not to worry, we can send the link again
        </span>
        <div className={s.active_group}>
          <Input
            label="Email"
            placeholder="Epam@epam.com"
            className={s.input_conf}
            error={errors.email?.message}
            {...register("email", {
              required: "Enter your email",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "The email must match the format example@example.com",
              },
            })}
          />
          <Button type="submit" disabled={!isValid} className={s.button}>
            Resend verification link
          </Button>
        </div>

        <Image className={s.rafiki_img} src={"/rafiki_web.png"} alt="rafiki" width={1000} height={1000} priority />
        <Button disabled={!isValid} className={s.button_mobileOnly}>
          {!isPending ? <span>Resend verification link</span> : <span>Sending...</span>}
        </Button>
      </form>
    </Container>
  )
}
