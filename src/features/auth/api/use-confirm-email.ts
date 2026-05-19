import { useMutation } from "@tanstack/react-query"
import { ConfirmEmailError } from "../types/auth-api.types"

export const useConfirmEmail = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      const params = new URLSearchParams({ code })

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/auth/confirm-email?${params}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      })

      if (response.status === 200) {
        return { success: true }
      }

      const data = await response.json()

      if (!response.ok) {
        throw data as ConfirmEmailError
      }

      return data
    },
  })
}
