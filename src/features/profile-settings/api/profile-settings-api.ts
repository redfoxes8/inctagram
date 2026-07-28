import { useMutation, useQuery } from "@tanstack/react-query"

import { client } from "@/shared/api/client"
import type { SchemaGetProfileResponseDto, SchemaUpdateProfileDto } from "@/shared/api/schema"

const PROFILE_QUERY_KEY = "profile-settings"
export const SERVER_ERROR_MESSAGE = "Error! Server is not available!"

export class ProfileSettingsApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(SERVER_ERROR_MESSAGE)
    this.name = "ProfileSettingsApiError"
  }
}

export const getProfileSettingsQueryKey = (userId?: string | null) => [PROFILE_QUERY_KEY, userId] as const

const getProfile = async (userId: string): Promise<SchemaGetProfileResponseDto> => {
  const { data, error } = await client.GET("/api/v1/profile/{userId}", {
    params: {
      path: { userId },
    },
  })

  if (error || !data) {
    throw new Error(SERVER_ERROR_MESSAGE)
  }

  return data
}

const updateProfile = async (payload: SchemaUpdateProfileDto): Promise<void> => {
  const { error, response } = await client.PUT("/api/v1/profile/update", {
    body: payload,
  })

  if (error) {
    throw new ProfileSettingsApiError(response.status, error)
  }
}

export const useProfileSettingsQuery = (userId: string | null | undefined) => {
  return useQuery<SchemaGetProfileResponseDto, Error>({
    queryKey: getProfileSettingsQueryKey(userId),
    queryFn: () => {
      if (!userId) {
        throw new Error("User id is required")
      }

      return getProfile(userId)
    },
    enabled: Boolean(userId),
  })
}

export const useUpdateProfileSettingsMutation = () => {
  return useMutation<void, ProfileSettingsApiError, SchemaUpdateProfileDto>({
    mutationFn: updateProfile,
  })
}
