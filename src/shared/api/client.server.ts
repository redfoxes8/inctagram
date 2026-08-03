import createClient, { Middleware } from "openapi-fetch"
import { paths } from "@/shared/api/schema"
import { cookies } from "next/headers"
import { localStorageKeys } from "@/features/auth/types"

// 1. Получаем базовый URL
const rawBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4278"

// 2. ИСПРАВЛЕНИЕ FETCH FAILED: Заменяем буквенный 'localhost' на чистый IPv4 '127.0.0.1'
// Это гарантирует, что Node.js на сервере мгновенно найдет бэкенд на порту 4278
const baseUrl = rawBaseUrl.replace("localhost", "127.0.0.1")

export const serverClient = createClient<paths>({
  baseUrl,
})

const serverAuthMiddleware: Middleware = {
  async onRequest({ request }) {
    try {
      const cookieStore = await cookies()
      const accessToken = cookieStore.get(localStorageKeys.accessToken)?.value || null

      if (accessToken) {
        request.headers.set("Authorization", `Bearer ${accessToken}`)
      }
    } catch (e) {
      // Игнорируем вне контекста запроса
    }

    request.headers.set("accept", "application/json")
    return request
  },
}

serverClient.use(serverAuthMiddleware)
