import { useMutation } from "@tanstack/react-query"

import { client } from "@/shared/api/client"
import { localStorageKeys, LoginRequestPayload, LoginResponse } from "../types"
import { queryClient } from "@/shared/api/query-client"

export const useLoginMutation = () => {
  return useMutation<LoginResponse, Error, LoginRequestPayload>({
    mutationFn: async (payload: LoginRequestPayload) => {
      const clientData = await client.POST("/api/v1/auth/login", {
        body: payload,
      })

      if (!clientData) {
        throw new Error("Login failed")
      }

      return clientData.data as LoginResponse
    },

    onSuccess: async (data) => {
      localStorage.setItem(localStorageKeys.accessToken, data.accessToken)
      // Запрашиваем данные пользователя сразу после логина
      await queryClient.invalidateQueries({ queryKey: ["me"] })
    },
  })
}
