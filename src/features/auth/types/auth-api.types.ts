export type ConfirmEmailError = {
  statusCode: number
  message: string
  errorsMessages: Array<{
    message: string
    field: string
  }>
}
