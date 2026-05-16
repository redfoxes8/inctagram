import { components } from "@/shared/api/schema"

export type LoginRequestPayload = components["schemas"]["LoginDTO"]

export type LoginResponse = {
  accessToken: string
}
