import { useMutation } from "@tanstack/react-query"

import { client } from "@/shared/api/client"
import { localStorageKeys, PasswordRecoveryPayload } from "@/features/auth/types"

type ApiError = {
  statusCode: number
  message: string
  errorsMessages?: {
    message: string
    field: string
  }[]
}

export const useForgotPasswordMutation = () => {
  return useMutation<void, Error, PasswordRecoveryPayload>({
    mutationFn: async ({ email, recaptchaToken }: PasswordRecoveryPayload) => {
      const { error } = await client.POST("/api/v1/auth/password-recovery", {
        body: { email },

        params: {
          header: {
            recaptcha: recaptchaToken,
          },
        },
      })

      if (error) {
        const apiError = error as ApiError
        const errorMessage = apiError.errorsMessages?.[0]?.message || apiError.message || "Password recovery failed"
        throw new Error(errorMessage)
      }
    },

    onSuccess: (_, variables) => {
      localStorage.setItem(localStorageKeys.recoveryEmail, variables.email)
    },
  })
}
