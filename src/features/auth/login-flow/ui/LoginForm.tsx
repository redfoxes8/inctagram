"use client"

import { useState } from "react"
import clsx from "clsx"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { Button } from "@/shared/ui/Button"
import { Icon } from "@/shared/ui/Icon"
import { Input } from "@/shared/ui/Input"

import s from "./LoginForm.module.css"
import { useLoginMutation } from "@/features/auth/api/use-login.mutation"
import { LoginRequestPayload } from "@/features/auth/api/auth.type"

const UNAUTHORIZED_ERROR = "Unauthorized"

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState("")

  const { mutateAsync: loginMutation, isPending } = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginRequestPayload>({
    mode: "onBlur",
  })

  const onSubmit = async (data: LoginRequestPayload) => {
    setServerError("")

    try {
      await loginMutation(data)
      router.push("/profile")
    } catch {
      setServerError(UNAUTHORIZED_ERROR)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={s.content}>
      <h1 className="h1">Sign In</h1>
      <div className={s.icon_group}>
        <Image src="/icons/google-svgrepo-com.svg" height={36} width={36} alt="google" className={s.social_icon} />
        <Icon name="github-svgrepo-com (3) 1" className={s.github_icon} />
      </div>

      <div className={s.input_group}>
        <Input
          label="Email"
          placeholder="Epam@epam.com"
          className={s.input_conf}
          error={errors.usernameOrEmail?.message}
          {...register("usernameOrEmail", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Incorrect email address",
            },
          })}
        />

        <div className={s.password_container}>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="************"
            className={s.input_conf}
            rightIcon={<Icon name={showPassword ? "eye-outline" : "eye-off-outline"} />}
            onRightIconClick={() => setShowPassword((value) => !value)}
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 3,
                message: "Password must be at least 3 characters long",
              },
            })}
          />
          <Button asChild className={clsx("regular_text_14", s.forgot_password)}>
            <Link href="/forgot-password">Forgot Password</Link>
          </Button>
        </div>
      </div>

      <div className={s.button_group}>
        {serverError && <span>{serverError}</span>}

        <Button className={clsx(s.button_conf, "h3")} disabled={!isValid || isPending}>
          {isPending ? "Sending..." : "Sign In"}
        </Button>
        <span className={clsx("regular_text_16", s.registration_prompt)}>Don’t have an account?</span>
        <Button asChild variant="outlined" className={s.outlined_button_conf}>
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    </form>
  )
}
