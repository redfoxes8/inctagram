import { components } from "@/shared/api/schema"

export const localStorageKeys = {
  accessToken: "accessToken",
  recoveryEmail: " recoveryEmail",
}

export type LoginRequestPayload = components["schemas"]["LoginDTO"]
export type LoginResponse = components["schemas"]["LoginResponseDto"]

export type RegistrationEmailResendingPayload = components["schemas"]["EmailResendDto"]
export type ConfirmEmailError = {
  statusCode: number
  message: string
  errorsMessages: Array<{ message: string; field: string }>
}

export type PasswordRecoveryDto = components["schemas"]["PasswordRecoveryDto"]
export type PasswordRecoveryPayload = PasswordRecoveryDto & { recaptchaToken: string }

export type ChangePasswordPayload = components["schemas"]["ChangePasswordDTO"]

export type MeResponse = components["schemas"]["UserMeResponseDto"]

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
// ===================================

// export type RegisterUserPayload = {
//   username: string
//   email: string
//   password: string
//   passwordConfirmation?: string
// }

// export type RegistrationResponse = {
//   code?: string
// } | void

// export type ApiError = {
//   code: number
//   message: string
//   extensions: any[]
// }
