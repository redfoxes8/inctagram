export const localStorageKeys = {
  accessToken: "accessToken",
}

export type LoginRequestPayload = {
  usernameOrEmail: string
  password: string
}

export type LoginResponse = {
  accessToken: string
}
