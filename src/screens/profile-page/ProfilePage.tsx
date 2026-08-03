// screens/profile-page/ProfilePage.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ProfileHeader } from "@/widgets/profile-header"
import { PostFeed } from "@/widgets/post-feed"
import { PostModal } from "@/widgets/post-modal/ui"
import { useMeQuery } from "@/features/auth/api/use-me"
import { useQuery } from "@tanstack/react-query"
import { client } from "@/shared/api/client"
import { components } from "@/shared/api/schema"
import s from "./ProfilePage.module.css"

// ✅ ПРАВИЛЬНЫЙ ТИП!
type ProfileResponse = components["schemas"]["GetProfileResponseDto"]

type ProfilePageProps = {
  userId: string
  postId?: string
  serverProfile: ProfileResponse
}

export const ProfilePage = ({ userId: propUserId, postId: initialPostId, serverProfile }: ProfilePageProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { data: me } = useMeQuery()
  const myId = me?.userId

  const isOwner = Boolean(myId && propUserId && myId === propUserId)

  const { data: profile, isLoading } = useQuery<ProfileResponse>({
    queryKey: ["userProfile", propUserId],
    queryFn: async () => {
      const { data, error } = await client.GET("/api/v1/profile/{userId}", {
        params: {
          path: { userId: propUserId },
        },
      })

      if (error) {
        throw new Error("Profile not found")
      }

      if (!data) {
        throw new Error("No data received")
      }

      return data
    },
    initialData: serverProfile,
    staleTime: 1000 * 60 * 5,
  })

  const [selectedPostId, setSelectedPostId] = useState<string | undefined>(
    initialPostId || searchParams.get("postId") || undefined,
  )

  useEffect(() => {
    const postIdFromUrl = searchParams.get("postId")
    if (postIdFromUrl && postIdFromUrl !== selectedPostId) {
      setSelectedPostId(postIdFromUrl)
    }
  }, [searchParams, selectedPostId])

  const handlePostClick = useCallback(
    (postId: string) => {
      setSelectedPostId(postId)
      router.push(`${pathname}?postId=${postId}`, { scroll: false })
    },
    [pathname, router],
  )

  const handlePostModalClose = useCallback(() => {
    setSelectedPostId(undefined)
    router.push(pathname, { scroll: false })
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className={s.loading}>
        <h3 className="h3">Загрузка профиля...</h3>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className={s.userNotFound}>
        <h3 className="h3">⚠️ Профиль не найден</h3>
        <p>Не удалось получить данные для ID: {propUserId}</p>
      </div>
    )
  }

  // ✅ НЕТ НОРМАЛИЗАЦИИ! Используем данные как есть
  return (
    <div className={s.container}>
      <ProfileHeader user={profile} isOwner={isOwner} />

      <PostFeed
        userId={propUserId}
        isOwner={isOwner}
        pageSize={8}
        onPostClick={handlePostClick}
        useFeedEndpoint={isOwner}
      />

      {selectedPostId && (
        <PostModal
          postId={selectedPostId}
          isOpen={!!selectedPostId}
          onClose={handlePostModalClose}
          isOwnProfile={isOwner}
        />
      )}
    </div>
  )
}
