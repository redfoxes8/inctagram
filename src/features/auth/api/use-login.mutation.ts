import { useMutation } from "@tanstack/react-query"
import { client } from "@/shared/api/client"
import { localStorageKeys, LoginRequestPayload, LoginResponse } from "../types"
import { queryClient } from "@/shared/api/query-client"

export const useLoginMutation = () => {
  return useMutation<LoginResponse, Error, LoginRequestPayload>({
    mutationFn: async (payload: LoginRequestPayload) => {
      const { data, error } = await client.POST("/api/v1/auth/login", {
        body: payload,
        credentials: "include",
      })

      if (error) {
        throw new Error(JSON.stringify(error))
      }

      if (!data) {
        throw new Error("Backend returned no data")
      }

      return data as LoginResponse
    },

    onSuccess: async (data) => {
      localStorage.setItem(localStorageKeys.accessToken, data.accessToken)
      // Запрашиваем данные пользователя сразу после логина
      await queryClient.invalidateQueries({ queryKey: ["me"] })
    },
  })
}
