import createClient, { Middleware } from "openapi-fetch"
import { paths } from "@/shared/api/schema"
import { localStorageKeys } from "@/features/auth/api/auth.type"

export const client = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
})

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const accessToken = localStorage.getItem(localStorageKeys.accessToken)

    if (accessToken) {
      request.headers.set("Authorization", `Bearer ${accessToken}`)
    }

    request.headers.set("accept", "application/json")

    return request
  },
}

client.use(authMiddleware)
