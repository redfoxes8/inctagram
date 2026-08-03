import { useQuery } from "@tanstack/react-query"
import { client } from "@/shared/api/client"
import { ProfileResponse } from "../model/profile.type"
import { getProfileSettingsQueryKey } from "@/features/profile-settings/api/profile-settings-api"

interface UseProfileQueryOptions {
  userId: string
  initialData?: ProfileResponse
}

export const useProfileQuery = ({ userId, initialData }: UseProfileQueryOptions) => {
  return useQuery<ProfileResponse>({
    queryKey: getProfileSettingsQueryKey(userId),
    queryFn: async () => {
      const { data, error } = await client.GET("/api/v1/profile/{userId}", {
        params: {
          path: { userId },
        },
      })

      if (error || !data) {
        throw new Error("Profile not found")
      }

      return data
    },
    initialData,
    staleTime: 1000 * 60 * 5,
  })
}
