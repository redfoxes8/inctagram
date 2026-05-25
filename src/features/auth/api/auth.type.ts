import { components } from "@/shared/api/schema"

export type LoginRequestPayload = components["schemas"]["LoginDTO"]

export type LoginResponse = {
  accessToken: string
}

export const localStorageKeys = {
  accessToken: "accessToken",
  recoveryEmail: " recoveryEmail",
}

export type RegistrationEmailResendingPayload = components["schemas"]["EmailResendDto"]

export type PasswordRecoveryDto = components["schemas"]["PasswordRecoveryDto"]

export type PasswordRecoveryPayload = PasswordRecoveryDto & {
  recaptchaToken: string
}

export type ChangePasswordPayload = components["schemas"]["ChangePasswordDTO"]
