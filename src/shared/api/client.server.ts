import createClient, { Middleware } from "openapi-fetch"
import { paths } from "@/shared/api/schema"
import { cookies } from "next/headers"

const baseUrl = process.env.API_BASE_URL

if (!baseUrl) {
  throw new Error("API_BASE_URL is not configured")
}

export const serverClient = createClient<paths>({
  baseUrl,
})

const serverAuthMiddleware: Middleware = {
  async onRequest({ request }) {
    try {
      const cookieStore = await cookies()

      const cookieString = cookieStore.toString()

      if (cookieString) {
        request.headers.set("Cookie", cookieString)
      }
    } catch (e) {
      console.error("Не удалось прочитать или пробросить куки на сервере Next.js:", e)
    }

    request.headers.set("accept", "application/json")
    return request
  },
}

serverClient.use(serverAuthMiddleware)
