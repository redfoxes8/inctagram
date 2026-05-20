"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import clsx from "clsx"
import { useForm } from "react-hook-form"
import { Button, Input } from "@/shared/ui"
import { Icon } from "@/shared/ui/Icon"
import s from "./ChangePasswordForm.module.css"
import { ChangePasswordPayload } from "@/features/auth/api/auth.type"
import { useChangePasswordMutation } from "@/features/auth/api/use-change-password.mutation"
import { confirmPasswordValidation, passwordValidation } from "@/shared/lib/validation/password.validation"

type ChangePasswordFormValues = {
  password: string
  confirmPassword: string
}

export function ChangePasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const recoveryCode = searchParams.get("code")

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { mutateAsync: changePasswordMutation, isPending, error } = useChangePasswordMutation()

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<ChangePasswordFormValues>({
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const password = watch("password")
  const confirmPassword = watch("confirmPassword")

  useEffect(() => {
    if (confirmPassword) {
      trigger("confirmPassword")
    }
  }, [password, confirmPassword, trigger])

  const onSubmit = async (data: ChangePasswordFormValues) => {
    if (!recoveryCode) return

    const payload: ChangePasswordPayload = {
      recoveryCode,
      newPassword: data.password,
    }
    await changePasswordMutation(payload)
    router.replace("/login")
  }

  const errorMessage = error instanceof Error ? error.message : null

  return (
    <main className={s.wrapper}>
      <div className={s.content}>
        <span className="h1"> Create New Password</span>
        <form onSubmit={handleSubmit(onSubmit)} className={s.form}>
          <div className={s.input_group}>
            <Input
              label="New password"
              type={showNewPassword ? "text" : "password"}
              placeholder="************"
              autoComplete="new-password"
              className={s.input_conf}
              rightIcon={<Icon name={showNewPassword ? "eye-outline" : "eye-off-outline"} />}
              onRightIconClick={() => setShowNewPassword((prev) => !prev)}
              error={errors.password?.message}
              {...register("password", passwordValidation)}
            />

            <Input
              label="Password confirmation"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="************"
              className={s.input_conf}
              autoComplete="new-password"
              rightIcon={<Icon name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} />}
              onRightIconClick={() => setShowConfirmPassword((prev) => !prev)}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", confirmPasswordValidation(password))}
            />
          </div>

          <p className={clsx("regular_text_14", s.password_info)}>Your password must be between 6 and 20 characters</p>

          <div className={s.button}>
            {errorMessage && <span className={s.error_message}>{errorMessage}</span>}

            <Button
              type="submit"
              className={clsx(s.button_conf, "h3")}
              disabled={!isValid || isPending || !recoveryCode}
            >
              {isPending ? "Creating..." : "Create new password"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
