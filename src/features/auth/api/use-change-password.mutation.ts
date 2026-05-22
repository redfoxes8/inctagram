import { useMutation } from "@tanstack/react-query"

import { client } from "@/shared/api/client"

import { ChangePasswordPayload, localStorageKeys } from "@/features/auth/api/auth.type"

type ApiError = {
  statusCode: number
  message: string
  errorsMessages?: {
    message: string
    field: string
  }[]
}

export const useChangePasswordMutation = () => {
  return useMutation<void, Error, ChangePasswordPayload>({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const { error } = await client.POST("/api/v1/auth/change-password", {
        body: payload,
      })

      if (error) {
        const apiError = error as ApiError
        const errorMessage = apiError.errorsMessages?.[0]?.message || apiError.message || "Failed to change password"
        throw new Error(errorMessage)
      }
    },

    retry: (count, error) => {
      return error.message.includes("network") && count < 2
    },

    onSuccess: () => {
      localStorage.removeItem(localStorageKeys.recoveryEmail)
    },
  })
}
