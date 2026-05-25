import { client } from "@/shared/api/client"
import { useMutation } from "@tanstack/react-query"
import { ConfirmEmailError } from "../types/auth-api.types"

export const useConfirmEmail = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      const clientData = await client.POST("/api/v1/auth/confirm-email", {
        params: {
          query: { code },
        },
      })

      if (clientData.error) {
        const apiError = clientData.error as ConfirmEmailError

        const isRootMessageConfirmed = apiError?.message === "Email is already confirmed"

        const isAlreadyConfirmed = apiError.errorsMessages?.some((err) => err.message === "Email is already confirmed")

        if (isRootMessageConfirmed || isAlreadyConfirmed) {
          return { alreadyConfirmed: true }
        }

        throw apiError
      }

      return clientData.data
    },
  })
}
