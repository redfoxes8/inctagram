import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/shared/api/client"
import { localStorageKeys } from "@/features/auth/types"
import { useRouter } from "next/navigation"
import { PAGES } from "@/shared/config/pages.config"

export const useLogoutMutation = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      const response = await client.POST("/api/v1/auth/logout", {})
      if (response.error) {
        throw new Error("Logout failed")
      }
      return response.data
    },
    onSuccess: async () => {
      localStorage.removeItem(localStorageKeys.accessToken)
      queryClient.clear()

      router.refresh()

      router.replace(PAGES.LOGIN)
    },
    onError: (error) => {
      console.error("Logout failed:", error)
    },
  })
}
