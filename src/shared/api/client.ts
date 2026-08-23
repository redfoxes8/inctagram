import createClient, { Middleware } from "openapi-fetch"
import { paths } from "@/shared/api/schema"
import { localStorageKeys } from "@/features/auth/types"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not configured")
}

export const client = createClient<paths>({
  baseUrl,
})

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const authenticatedRequest = new Request(request, {
      credentials: "include",
    })

    const accessToken = localStorage.getItem(localStorageKeys.accessToken)

    if (accessToken) {
      authenticatedRequest.headers.set("Authorization", `Bearer ${accessToken}`)
    }

    authenticatedRequest.headers.set("accept", "application/json")

    return authenticatedRequest
  },
}

client.use(authMiddleware)
