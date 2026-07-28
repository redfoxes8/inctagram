import { useQuery } from "@tanstack/react-query"
import { client } from "@/shared/api/client"

export function useUserProfileQuery(userId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const response = await client.GET(`/api/v1/profile/${userId}` as any, {})

      if (response.error) {
        throw new Error("Failed to fetch user profile")
      }

      return response.data
    },
    enabled: enabled,
    retry: false,
  })
}
