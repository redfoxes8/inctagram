export const localStorageKeys = {
  accessToken: "accessToken",
}

// export type LoginRequestPayload = {
//   usernameOrEmail: string
//   password: string
// }
//
// export type LoginResponse = {
//   accessToken: string
// }

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

export type ConfirmEmailError = {
  statusCode: number
  message: string
  errorsMessages: Array<{
    message: string
    field: string
  }>
}
