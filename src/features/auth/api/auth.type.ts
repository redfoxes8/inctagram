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
