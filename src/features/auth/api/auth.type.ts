import { components } from "@/shared/api/schema"

export type LoginRequestPayload = components["schemas"]["LoginDTO"]
export type LoginResponse = { accessToken: string }

export const localStorageKeys = {
  accessToken: "accessToken",
  recoveryEmail: "recoveryEmail",
}

export type RegistrationEmailResendingPayload = components["schemas"]["EmailResendDto"]
export type PasswordRecoveryDto = components["schemas"]["PasswordRecoveryDto"]
export type PasswordRecoveryPayload = PasswordRecoveryDto & { recaptchaToken: string }
export type ChangePasswordPayload = components["schemas"]["ChangePasswordDTO"]

// ============ Добавлено для OAuth ============
export type OAuthProvider = "google" | "github"

export type OAuthLoginPayload = {
  provider: OAuthProvider
  code: string
}

export type OAuthResponse = {
  accessToken: string
  isNewUser?: boolean
  email?: string
  username?: string
}

export type LinkProviderPayload = {
  provider: OAuthProvider
  code: string
  email: string
  password: string
}

export type LinkProviderResponse = {
  accessToken: string
  message: string
}
