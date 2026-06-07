// features/auth/api/use-oauth.mutation.ts

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  localStorageKeys,
  OAuthLoginPayload,
  OAuthResponse,
  OAuthProvider,
  LinkProviderPayload,
  LinkProviderResponse,
} from "./auth.type"

// Класс ошибки для конфликта email
export class EmailExistsWithoutProviderError extends Error {
  public email: string
  public provider: OAuthProvider

  constructor(email: string, provider: OAuthProvider) {
    super(`User with email ${email} already exists but ${provider} account is not linked`)
    this.name = "EmailExistsWithoutProviderError"
    this.email = email
    this.provider = provider
  }
}

// Генерация username
const generateUsername = (): string => {
  return "user_" + Math.random().toString(36).substring(2, 8)
}

// Базовый URL бэкенда
const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://main-gateway-service.nymbi.org"
}

// Хук для OAuth входа
export const useOAuthMutation = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation<OAuthResponse, Error, OAuthLoginPayload>({
    mutationFn: async (payload: OAuthLoginPayload) => {
      const { provider, code } = payload

      // Формируем endpoint и redirectUri
      const endpoint =
        provider === "google" ? `${getBaseUrl()}/api/v1/auth/google/login` : `${getBaseUrl()}/api/v1/auth/github/login`

      const redirectUri = `${window.location.origin}/auth/${provider}/callback`

      // Получаем или генерируем username
      let username = sessionStorage.getItem("oauth_username") || ""
      if (!username) {
        username = generateUsername()
        sessionStorage.setItem("oauth_username", username)
      }

      // Отправляем запрос на бэкенд
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, username, redirectUri }),
      })

      const data = await response.json().catch(() => ({}))

      // Обработка ошибок
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid authorization code")
        }
        if (response.status === 404) {
          throw new Error("Endpoint not found")
        }
        if (response.status === 409) {
          const email = data.message?.match(/([^\s,]+@[^\s,]+)/)?.[1] || ""
          throw new EmailExistsWithoutProviderError(email, provider)
        }
        throw new Error(data.message || `${provider} authentication failed`)
      }

      // Очищаем временные данные
      sessionStorage.removeItem("oauth_username")
      sessionStorage.removeItem("oauth_provider")
      sessionStorage.removeItem("oauth_from_register")

      return data as OAuthResponse
    },

    onSuccess: async (data) => {
      if (data.accessToken) {
        localStorage.setItem(localStorageKeys.accessToken, data.accessToken)
      }
      await queryClient.invalidateQueries()
      router.push("/profile") // Редирект в профиль
    },

    onError: (error) => {
      console.error("OAuth error:", error.message)
    },
  })
}

// Хук для привязки провайдера
export const useLinkProviderMutation = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation<LinkProviderResponse, Error, LinkProviderPayload>({
    mutationFn: async (payload: LinkProviderPayload) => {
      const { provider, code, email, password } = payload
      const endpoint = `${getBaseUrl()}/api/v1/auth/link-provider`
      const redirectUri = `${window.location.origin}/auth/${provider}/callback`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, code, email, password, redirectUri }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (response.status === 401) throw new Error("Invalid credentials")
        throw new Error(data.message || "Failed to link provider")
      }

      return data as LinkProviderResponse
    },

    onSuccess: async (data) => {
      if (data.accessToken) localStorage.setItem(localStorageKeys.accessToken, data.accessToken)
      sessionStorage.removeItem("oauth_link_email")
      sessionStorage.removeItem("oauth_link_provider")
      sessionStorage.removeItem("oauth_link_code")
      await queryClient.invalidateQueries()
      router.push("/profile")
    },
  })
}
