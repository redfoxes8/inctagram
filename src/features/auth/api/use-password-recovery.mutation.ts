import { useMutation } from "@tanstack/react-query"

import { client } from "@/shared/api/client"
import { localStorageKeys, PasswordRecoveryPayload } from "./auth.type"

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
        throw new Error("Ошибка восстановления пароля")
      }
    },

    onSuccess: (_, variables) => {
      localStorage.setItem(localStorageKeys.recoveryEmail, variables.email)
    },
  })
}
