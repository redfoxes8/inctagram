import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { PostItem } from "@/entities/post/model/post.types"
import { SchemaUserMeResponseDto } from "@/shared/api/schema"
import { ProfileResponse } from "@/entities/user/model/profile.type"
import { client } from "@/shared/api/client"

export const usePostAuthor = (post: PostItem, currentUser?: SchemaUserMeResponseDto | null) => {
  const ownerId = post.ownerId

  const { data: ownerProfile } = useQuery<ProfileResponse, Error>({
    queryKey: ["profile", ownerId],
    queryFn: async () => {
      const { data, error } = await client.GET("/api/v1/profile/{userId}", {
        params: { path: { userId: ownerId } },
      })

      if (error || !data) {
        throw new Error("Failed to load profile")
      }

      return data
    },
    enabled: Boolean(ownerId) && !post.owner,
    staleTime: 5 * 60 * 1000,
  })

  const resolvedOwner = post.owner ?? ownerProfile

  const authorName = useMemo(() => {
    if (resolvedOwner?.username) {
      return resolvedOwner.username
    }
    if (currentUser && post.ownerId === currentUser.userId) {
      return currentUser.username
    }
    return `User ${post.ownerId?.slice(0, 8) || ""}`
  }, [resolvedOwner, currentUser, post.ownerId])

  const authorAvatar = useMemo(() => {
    if (resolvedOwner?.avatarUrl) {
      return resolvedOwner.avatarUrl
    }
    if (currentUser && post.ownerId === currentUser.userId) {
      return currentUser.avatarUrl || undefined
    }
    return undefined
  }, [resolvedOwner, currentUser, post.ownerId])

  return { authorName, authorAvatar }
}
