// src/app/auth/github/callback/page.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useOAuthMutation, EmailExistsWithoutProviderError } from "@/features/auth/api/use-oauth.mutation"

export default function GithubCallbackPage() {
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

      // Ошибка от GitHub
      if (errorParam) {
        setError(`Ошибка GitHub: ${errorParam}`)
        setTimeout(() => router.push(fromRegister ? "/register" : "/login"), 5000)
        return
      }

      // Нет code в URL
      if (!code) {
        setError("❌ Код авторизации не найден в URL")
        setTimeout(() => router.push(fromRegister ? "/register" : "/login"), 5000)
        return
      }

      try {
        await oauthMutation.mutateAsync({ provider: "github", code })
        // Успех - редирект в профиль (onSuccess мутации)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error"

        // Понятное сообщение об ошибке
        if (errorMessage.includes("404")) {
          setError("❌ GitHub OAuth не настроен на бэкенде (404). Используйте Google или email/пароль")
        } else if (errorMessage.includes("401")) {
          setError("❌ Ошибка 401: Неверный Client Secret или Redirect URI на бэкенде")
        } else if (errorMessage.includes("fetch")) {
          setError("❌ Ошибка сети: Бэкенд недоступен")
        } else {
          setError(`❌ Ошибка: ${errorMessage}`)
        }

        console.error("GitHub OAuth error:", err)

        // Перенаправление через 5 секунд
        setTimeout(() => {
          if (err instanceof EmailExistsWithoutProviderError) {
            sessionStorage.setItem("oauth_link_email", err.email)
            sessionStorage.setItem("oauth_link_provider", err.provider)
            sessionStorage.setItem("oauth_link_code", code)
            router.push("/login?mode=link")
          } else {
            router.push(fromRegister ? "/register" : `/login?error=${encodeURIComponent(errorMessage)}`)
          }
        }, 5000)
      }
    }

    handleCallback()
  }, [searchParams, router, oauthMutation])

  return (
    <div style={{ textAlign: "center", marginTop: "100px", padding: "20px" }}>
      {!error ? (
        <>
          <div>🔄 Выполняется вход через GitHub...</div>
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
          }}
        >
          <strong>{error}</strong>
          <div style={{ marginTop: "12px", fontSize: "12px" }}>⏱ Перенаправление через 5 секунд...</div>
        </div>
      )}
    </div>
  )
}
