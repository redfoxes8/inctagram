"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useOAuthMutation, EmailExistsWithoutProviderError } from "@/features/auth/api/use-oauth.mutation"
import { Suspense } from "react"

function OAuthCallbackContent() {
  // Путь: /oauth/callback - Google/GitHub перенаправляют сюда после успешного входа пользователя
  // Хук для навигации - router.push("/profile") - переходит на страницу профиля
  const router = useRouter()
  // Хук для чтения параметров из URL строки
  const searchParams = useSearchParams()
  // Хук oauthMutation.mutateAsync() - отправляет { provider, code } на бэкенд
  const oauthMutation = useOAuthMutation()

  useEffect(() => {
    const handleCallback = async () => {
      // Временный код от провайдера из URL ?code=...
      const code = searchParams.get("code")
      // Проверяем ошибку от провайдера в URL ?error=...
      const error = searchParams.get("error")
      // Провайдер из sessionStorage (сохранен при клике на кнопку Google/GitHub)
      const provider = sessionStorage.getItem("oauth_provider")
      // Проверяем, с какой страницы пришел пользователь (логин или регистрация)
      const fromRegister = sessionStorage.getItem("oauth_from_register") === "true"

      // Удаляем сохраненные данные, чтобы они не мешали при следующих попытках
      sessionStorage.removeItem("oauth_provider")
      sessionStorage.removeItem("oauth_from_register")

      // Если error - перенаправляем на страницу регистрации или на страницу логина
      if (error) {
        router.push(fromRegister ? "/register?error=oauth_failed" : "/login?error=oauth_failed")
        return
      }

      // Если нет code или нет provider - перенаправляем на страницу входа/регистрации
      if (!code || !provider) {
        router.push(fromRegister ? "/register" : "/login")
        return
      }

      // mutateAsync - отправка code на бэкенд
      try {
        await oauthMutation.mutateAsync({
          provider: provider as "google" | "github",
          code,
        })
        // Если запрос успешен - бэкенд вернул accessToken - перенаправляем пользователя на страницу профиля
        router.push("/profile")
      } catch (err) {
        // Типизируем err - если является экземпляром Error - берем err.message, иначе - "Unknown error"
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        // Логируем ошибку в консоль для отладки
        console.error("OAuth callback error details:", err)

        // EmailExistsWithoutProviderError - пользователь с таким email уже существует,
        // но этот Google/GitHub аккаунт к нему не привязан
        if (err instanceof EmailExistsWithoutProviderError) {
          // Сохраняем в sessionStorage:
          // - существующий email пользователя
          // - провайдер, через который пытаются войти
          // - code от провайдера (понадобится для привязки)
          sessionStorage.setItem("oauth_link_email", err.email)
          sessionStorage.setItem("oauth_link_provider", err.provider)
          sessionStorage.setItem("oauth_link_code", code)
          // Перенаправляем на страницу логина с параметром mode=link
          router.push("/login?mode=link")
        } else {
          // Другие ошибки - перенаправляем обратно с параметрами error и details
          router.push(
            fromRegister
              ? `/register?error=oauth_failed&details=${encodeURIComponent(errorMessage)}`
              : `/login?error=oauth_failed&details=${encodeURIComponent(errorMessage)}`,
          )
        }
      }
    }

    // Вызываем handleCallback при загрузке страницы
    handleCallback()
    // Добавляем зависимости, чтобы избежать предупреждений ESLint
    // Эффект перезапустится, если эти значения изменятся
  }, [searchParams, router, oauthMutation])

  // Пока происходит обработка (запрос на бэкенд), пользователь видит этот UI
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      {/* Основной текст загрузки */}
      <div>Выполняется вход через OAuth...</div>
      {/* Дополнительный мелкий текст для информирования */}
      <div style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>Пожалуйста, подождите</div>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <OAuthCallbackContent />
    </Suspense>
  )
}
