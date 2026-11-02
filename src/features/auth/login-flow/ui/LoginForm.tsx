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
import {
  getSuperadminLoginErrorMessage,
  useSuperadminLoginMutation,
} from "@/features/auth/api/use-superadmin-login.mutation"
import { LoginRequestPayload } from "@/features/auth/types"
import { PAGES } from "@/shared/config/pages.config"

export function LoginForm({ variant = "user" }: { variant?: "user" | "superadmin" }) {
  const isSuperadmin = variant === "superadmin"
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState("")

  const { mutateAsync: userLogin, isPending: isUserLoginPending } = useLoginMutation()
  const { login: superadminLogin, isPending: isSuperadminLoginPending } = useSuperadminLoginMutation()
  const isPending = isSuperadmin ? isSuperadminLoginPending : isUserLoginPending

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginRequestPayload>({
    mode: "onBlur",
  })

  const onSubmit = async (data: LoginRequestPayload) => {
    setServerError("")

    try {
      if (isSuperadmin) {
        await superadminLogin({ email: data.usernameOrEmail, password: data.password })
        router.replace(PAGES.SUPERADMIN_USERS)
      } else {
        await userLogin(data)
      }
    } catch (error) {
      setServerError(isSuperadmin ? getSuperadminLoginErrorMessage(error) : "Unauthorized")
    }
  }

  // ФУНКЦИЯ-ОБРАБОТЧИК OAuth ВХОДА - перенаправляет пользователя на страницу аутентификации Google или GitHub
  const handleOAuthLogin = (provider: "google" | "github") => {
    // Путь, который ожидает бэкенд
    let redirectUri = ""
    if (provider === "google") {
      redirectUri = `${window.location.origin}/auth/google/callback`
    } else {
      redirectUri = `${window.location.origin}/auth/github/callback`
    }

    // Переменная для хранения URL аутентификации провайдера
    let authUrl = ""
    if (provider === "google") {
      //ФОРМИРОВАНИЕ URL ДЛЯ КОНКРЕТНОГО ПРОВАЙДЕРА
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`
      // Идентификатор приложения в Google, куда вернуться после входа, запрашиваем временный код, запрашиваем доступ к email и профилю
    } else {
      authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`
      // `client_id'- id приложения,`&redirect_uri=${redirectUri}`- куда вернуться после входа, `&scope=user:email` - запрашиваем доступ к email
    }
    // Сохраняем в sessionStorage - будут использованы на странице /auth/:provider/callback после возврата от провайдера
    sessionStorage.setItem("oauth_provider", provider)
    sessionStorage.setItem("oauth_username", "") // Добавляем пустой username для передачи бэкенду
    window.location.href = authUrl // Пользователь переходит на Google/GitHub
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={clsx(s.content, isSuperadmin && s.superadmin)}
      aria-busy={isSuperadmin ? isPending || isSubmitting : undefined}
    >
      {" "}
      {/* Форма регистрации */}
      <h1 className="h1">Sign In</h1> {/* Заголовок формы */}
      {!isSuperadmin && (
        <div className={s.icon_group}>
          {" "}
          {/* Инициализацию OAuth входа через Google или GitHub, БЛОК С ИКОНКАМИ OAuth ПРОВАЙДЕРОВ*/}
          <Image
            src="/icons/google-svgrepo-com.svg"
            height={36}
            width={36}
            alt="google"
            className={s.social_icon}
            onClick={() => handleOAuthLogin("google")}
            style={{ cursor: "pointer" }}
          />
          <Icon
            name="github-svgrepo-com (3) 1"
            className={s.github_icon}
            onClick={() => handleOAuthLogin("github")}
            style={{ cursor: "pointer" }}
          />
        </div>
      )}
      <div className={s.input_group}>
        <Input
          label="Email"
          id={isSuperadmin ? "superadmin-email" : undefined}
          type={isSuperadmin ? "email" : undefined}
          autoComplete={isSuperadmin ? "username" : undefined}
          disabled={isSuperadmin ? isPending || isSubmitting : undefined}
          // value={""}
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
            // value={""}
            label="Password"
            id={isSuperadmin ? "superadmin-password" : undefined}
            autoComplete={isSuperadmin ? "current-password" : undefined}
            disabled={isSuperadmin ? isPending || isSubmitting : undefined}
            type={showPassword ? "text" : "password"}
            placeholder="************"
            className={s.input_conf}
            rightIcon={
              <Icon
                name={
                  isSuperadmin
                    ? showPassword
                      ? "eye-off-outline"
                      : "eye-outline"
                    : showPassword
                      ? "eye-outline"
                      : "eye-off-outline"
                }
              />
            }
            onRightIconClick={() => setShowPassword((value) => !value)}
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: isSuperadmin
                ? undefined
                : {
                    value: 3,
                    message: "Password must be at least 3 characters long",
                  },
            })}
          />
          {!isSuperadmin && (
            <Button asChild className={clsx("regular_text_14", s.forgot_password)}>
              <Link href="/forgot-password">Forgot Password</Link>
            </Button>
          )}
        </div>
      </div>
      <div className={s.button_group}>
        {serverError && (
          <span role={isSuperadmin ? "alert" : undefined} className={isSuperadmin ? s.error : undefined}>
            {serverError}
          </span>
        )}

        <Button
          className={clsx(s.button_conf, "h3")}
          disabled={isSuperadmin ? isPending || isSubmitting : !isValid || isPending}
        >
          {isPending ? "Sending..." : "Sign In"}
        </Button>
        {!isSuperadmin && (
          <>
            <span className={clsx("regular_text_16", s.registration_prompt)}>Don’t have an account?</span>
            <Button asChild variant="outlined" className={s.outlined_button_conf}>
              <Link href={PAGES.REGISTRATION}>Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </form>
  )
}
