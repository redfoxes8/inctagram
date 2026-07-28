"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ProfileHeader } from "@/widgets/profile-header"
import { PostFeed } from "@/widgets/post-feed"
import { PostModal } from "@/widgets/post-modal/ui"
import { useMeQuery } from "@/features/auth/api/use-me"
import { useProfileStore } from "@/entities/user/model/profile-store"
import { useQuery } from "@tanstack/react-query" // Импортируем useQuery
import { client } from "@/shared/api/client"
import s from "./ProfilePage.module.css"

type ProfilePageProps = {
  userId: string
  postId?: string
}

const TEST_POST_ID = "0215102c-af52-43e1-b0d2-e73d7f63bb97"

export const ProfilePage = ({ userId: propUserId, postId: initialPostId }: ProfilePageProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 1. Хуки данных
  const cachedProfile = useProfileStore((state) => state.cachedProfile)
  const { data: me, isLoading: isMeLoading } = useMeQuery()

  const myId = me?.userId
  const isOwner = Boolean(myId && propUserId && myId === propUserId)

  // 2. ДОЗАГРУЗКА ИЗ API: Если профиль чужой и в Zustand пусто — делаем запрос к бэкенду
  const shouldFetch = !isOwner && !cachedProfile && Boolean(propUserId)

  const { data: fetchedUserProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["userProfile", propUserId],
    queryFn: async () => {
      const response = await client.GET(`/api/v1/profile/${propUserId}` as any, {})
      if (response.error) throw new Error("Profile not found")
      return response.data
    },
    enabled: shouldFetch,
    retry: false,
  })

  const [selectedPostId, setSelectedPostId] = useState<string | undefined>(
    initialPostId || searchParams.get("postId") || undefined,
  )

  // Очистка стейта при уходе
  const setCachedProfile = useProfileStore((state) => state.setCachedProfile)
  useEffect(() => {
    return () => {
      setCachedProfile(null)
    }
  }, [setCachedProfile])

  useEffect(() => {
    const postIdFromUrl = searchParams.get("postId")
    if (postIdFromUrl && postIdFromUrl !== selectedPostId) {
      setSelectedPostId(postIdFromUrl)
    }
  }, [searchParams, selectedPostId])

  const handlePostClick = useCallback(
    (postId: string) => {
      setSelectedPostId(postId)
      router.push(`${pathname}?postId=${postId}`)
    },
    [pathname, router],
  )

  const handlePostModalClose = useCallback(() => {
    setSelectedPostId(undefined)
    router.push(pathname)
  }, [pathname, router])

  // Ждем загрузку или вашей учетки, или профиля чужого юзера
  if (isMeLoading || isProfileLoading) {
    return (
      <div className={s.loading}>
        <div className="spinner">Loading...</div>
      </div>
    )
  }

  // 3. ВЫБИРАЕМ ИСТОЧНИК ДАННЫХ
  // Сначала проверяем, мой ли профиль. Если нет — берем Zustand, а если и там пусто — берем то, что скачали из API
  const userToRender = isOwner ? me : cachedProfile || fetchedUserProfile

  if (!userToRender) {
    return (
      <div className={s.userNotFound} style={{ color: "white", padding: "40px", textAlign: "center" }}>
        <h3 className="h3" style={{ color: "orange" }}>
          ⚠️ Профиль не найден
        </h3>
        <p>Не удалось получить данные из Zustand или API для ID: {propUserId}</p>
      </div>
    )
  }

  return (
    <div className={s.container}>
      <ProfileHeader user={userToRender as any} isOwner={isOwner} />

      <PostFeed
        userId={propUserId}
        isOwner={isOwner}
        pageSize={8}
        onPostClick={handlePostClick}
        useFeedEndpoint={true}
      />

      {selectedPostId && (
        <PostModal
          postId={TEST_POST_ID}
          isOpen={!!selectedPostId}
          // @ts-ignore
          onClose={handlePostModalClose}
          isOwnProfile={isOwner}
        />
      )}
    </div>
  )
}
