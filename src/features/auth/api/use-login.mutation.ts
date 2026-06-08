import { useMutation } from "@tanstack/react-query"
import { client } from "@/shared/api/client"
import { localStorageKeys, LoginRequestPayload, LoginResponse } from "@/features/auth/api/auth.type"

export const useLoginMutation = () => {
  return useMutation<LoginResponse, Error, LoginRequestPayload>({
    mutationFn: async (payload: LoginRequestPayload) => {
      const { data, error } = await client.POST("/api/v1/auth/login", {
        body: payload,
        credentials: "include",
      })

      if (error || !data) {
        throw new Error("Login failed")
      }

      return data as LoginResponse
    },

    onSuccess: async (data) => {
      localStorage.setItem(localStorageKeys.accessToken, data.accessToken)
    },
  })
}
