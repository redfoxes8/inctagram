import { useQuery } from "@tanstack/react-query"
import { client } from "@/shared/api/client"
import { localStorageKeys, MeResponse } from "@/features/auth/types"

export function useMeQuery() {
  return useQuery<MeResponse, Error>({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await client.GET("/api/v1/users/me" as any, {})

      if (response.error) {
        throw Object.assign(new Error("Unauthorized"), { status: 401 })
      }

      return response.data as MeResponse
    },
    retry: false, // работает только локально
  })
}
