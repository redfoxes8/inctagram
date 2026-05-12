export type RegisterUserPayload = {
  username: string
  email: string
  password: string
  passwordConfirmation?: string
}

export type RegistrationResponse = {
  code?: string
} | void

export type ApiError = {
  code: number
  message: string
  extensions: any[]
}
