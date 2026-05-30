import { components } from "@/shared/api/schema"

export type LoginRequestPayload = components["schemas"]["LoginDTO"]

export type LoginResponse = {
  accessToken: string
}

export const localStorageKeys = {
  accessToken: "accessToken",
  recoveryEmail: "recoveryEmail",
}

export type RegistrationEmailResendingPayload = components["schemas"]["EmailResendDto"]

export type PasswordRecoveryDto = components["schemas"]["PasswordRecoveryDto"]

export type PasswordRecoveryPayload = PasswordRecoveryDto & {
  recaptchaToken: string
}

export type ChangePasswordPayload = components["schemas"]["ChangePasswordDTO"]

// ============ Добавлено для OAuth ============
// Тип для провайдера - ограничиваем только двумя значениями
export type OAuthProvider = "google" | "github"

// фронтенд отправляет на бэкенд
export type OAuthLoginPayload = {
  provider: OAuthProvider
  code: string // временный код от Google/GitHub
}

// бэкенд возвращает
export type OAuthResponse = {
  accessToken: string // JWT для авторизации
  isNewUser?: boolean // пользователь только что зарегистрирован
  email?: string
  username?: string
}

// Для привязки провайдера к существующему аккаунту
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

// Тип для обработки ошибки "email уже существует без привязанного провайдера"
export type OAuthConflictError = {
  statusCode: 409
  message: string
  email: string
}
