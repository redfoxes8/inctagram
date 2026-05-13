import { components } from "@/shared/api/schema"

export type RegisterUserPayload = {
  username: string
  email: string
  password: string
  passwordConfirmation?: string
}

export type RegistrationResponse = {
  code?: string
} | void

export type ApiErrorResponse = {
  data: {
    message: string
    field: string
  }[]
  error: string
  statusCode: number
}

export const localStorageKeys = {
  accessToken: "accessToken",
}

export type LoginRequestPayload = components["schemas"]["LoginDTO"]

export type LoginResponse = {
  accessToken: string
}
