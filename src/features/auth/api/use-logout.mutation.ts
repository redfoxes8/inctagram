import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/shared/api/client"
import { localStorageKeys } from "@/features/auth/api/auth.type"

export const useLogoutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await client.POST("/api/v1/auth/logout", {})

      // Проверяем response.error, а не response.data
      if (response.error) {
        throw new Error("Logout failed")
      }

      return response.data
    },

    onSuccess: async () => {
      // Чистим токен только при успешном ответе от сервера
      localStorage.removeItem(localStorageKeys.accessToken)

      // Очищаем кеш React Query
      queryClient.clear()
    },

    // Если сервер вернул ошибку - ничего не чистим
    onError: (error) => {
      console.error("Logout failed:", error)
      // Токен и кеш остаются на месте
    },
  })
}
