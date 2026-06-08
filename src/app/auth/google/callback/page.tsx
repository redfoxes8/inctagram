// src/app/auth/google/callback/page.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useOAuthMutation, EmailExistsWithoutProviderError } from "@/features/auth/api/use-oauth.mutation"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const oauthMutation = useOAuthMutation()
  const hasProcessed = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    const handleCallback = async () => {
      const code = searchParams.get("code")
      const errorParam = searchParams.get("error")
      const fromRegister = sessionStorage.getItem("oauth_from_register") === "true"

      sessionStorage.removeItem("oauth_from_register")
      sessionStorage.removeItem("oauth_provider")

      // Ошибка от Google
      if (errorParam) {
        setError(`Ошибка Google: ${errorParam}`)
        setTimeout(() => router.push(fromRegister ? "/register" : "/login"), 10000)
        return
      }

      // Нет code в URL
      if (!code) {
        setError("❌ Код авторизации не найден в URL")
        setTimeout(() => router.push(fromRegister ? "/register" : "/login"), 10000)
        return
      }

      try {
        await oauthMutation.mutateAsync({ provider: "google", code })
        // Успех - редирект в профиль (onSuccess мутации)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error"

        // ОШИБКА 401: ПОДРОБНОЕ ОБЪЯСНЕНИЕ
        if (errorMessage.includes("401") || errorMessage.includes("Invalid authorization code")) {
          setError(`
❌ ОШИБКА 401: НЕВОЗМОЖНО ВОЙТИ ЧЕРЕЗ GOOGLE

ФРОНТЕНД ОТПРАВЛЯЕТ ПРАВИЛЬНЫЕ ДАННЫЕ:
POST https://main-gateway-service.nymbi.org/api/v1/auth/google/login
{
  "code": "получен от Google",
  "username": "user_xxxxx",
  "redirectUri": "https://dev.nymbi.org:3000/auth/google/callback"
}

БЭКЕНД ОТВЕЧАЕТ: "Invalid authorization code"

👨‍💻 ДЛЯ РАЗРАБОТЧИКОВ (проверьте на бэкенде):
1. GOOGLE_CLIENT_SECRET - соответствует ли Client ID.
   
2. GOOGLE_REDIRECT_URI - должен быть точно:
   https://dev.nymbi.org:3000/auth/google/callback
   
3. Логи бэкенда - что возвращает Google API
          `)
        } else if (errorMessage.includes("fetch")) {
          setError("❌ Ошибка сети: Бэкенд недоступен. Используйте вход по email и паролю.")
        } else {
          setError(`❌ Ошибка: ${errorMessage}`)
        }

        console.error("Google OAuth error:", err)

        // Перенаправление через 10 секунд
        setTimeout(() => {
          if (err instanceof EmailExistsWithoutProviderError) {
            sessionStorage.setItem("oauth_link_email", err.email)
            sessionStorage.setItem("oauth_link_provider", err.provider)
            sessionStorage.setItem("oauth_link_code", code)
            router.push("/login?mode=link")
          } else {
            router.push(fromRegister ? "/register" : `/login?error=${encodeURIComponent(errorMessage)}`)
          }
        }, 20000)
      }
    }

    handleCallback()
  }, [searchParams, router, oauthMutation])

  return (
    <div style={{ textAlign: "center", marginTop: "100px", padding: "20px" }}>
      {!error ? (
        <>
          <div>🔄 Выполняется вход через Google...</div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "16px" }}>Пожалуйста, подождите</div>
        </>
      ) : (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "8px",
            textAlign: "left",
            whiteSpace: "pre-line",
            fontSize: "14px",
          }}
        >
          <strong>{error}</strong>
          <div style={{ marginTop: "12px", fontSize: "12px", textAlign: "center" }}>
            ⏱ Перенаправление через 20 секунд...
          </div>
        </div>
      )}
    </div>
  )
}
