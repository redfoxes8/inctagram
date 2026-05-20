import { useMutation } from "@tanstack/react-query"

import { client } from "@/shared/api/client"

import { ChangePasswordPayload, localStorageKeys } from "@/features/auth/api/auth.type"

export const useChangePasswordMutation = () => {
  return useMutation<void, Error, ChangePasswordPayload>({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const clientData = await client.POST("/api/v1/auth/change-password", {
        body: payload,
      })

      if (clientData.error) {
        const errorMessage =
          typeof clientData.error === "object" && clientData.error !== null && "message" in clientData.error
            ? String(clientData.error.message)
            : "Failed to change password"

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
