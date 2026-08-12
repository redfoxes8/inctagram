"use client"

import { useCallback, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ProfileHeader } from "@/widgets/profile-header"
import { PostFeed } from "@/widgets/post-feed"
import { PostModal } from "@/widgets/post-modal/ui"
import { useMeQuery } from "@/features/auth/api/use-me"
import { useProfileQuery } from "@/entities/user/api/use-profile"
import { ProfileResponse } from "@/entities/user/model/profile.type"
import s from "./ProfilePage.module.css"
import { PostsResponse, PostItem } from "@/entities/post/model/post.types"
import { revalidateFeed, revalidateProfile } from "@/shared/api/actions"
import { queryClient } from "@/shared/api/query-client"

export type ProfilePageProps = {
  userId: string
  postId?: string
  serverProfile: ProfileResponse
  serverPost?: PostItem
}

export const ProfilePage = ({ userId: propUserId, postId: initialPostId, serverProfile, serverPost }: ProfilePageProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: me, isLoading: isMeLoading } = useMeQuery()

  const { data: profile, isLoading: isProfileLoading } = useProfileQuery({
    userId: propUserId,
    initialData: serverProfile,
  })

  const isOwner = Boolean(me?.userId && propUserId && me.userId === propUserId)

  const selectedPostId = searchParams.get("postId") || initialPostId || undefined

  const postFrom = selectedPostId ?
    (initialPostId ? 'profile' : 'direct') : undefined

  const handlePostClick = useCallback(
    (postId: string) => {
      router.push(`${pathname}?postId=${postId}`, { scroll: false })
    },
    [pathname, router],
  )

  const handlePostModalClose = useCallback(() => {
    router.push(pathname, { scroll: false })
  }, [pathname, router])

  const handlePostUpdate = useCallback(async () => {
    // 1. Ревалидируем на сервере
    await revalidateProfile(propUserId)
    await revalidateFeed()

    // 2. Обновляем клиентский кэш
    await queryClient.invalidateQueries({
      queryKey: ['posts', propUserId]
    })

    // 3. Обновляем ленту
    await queryClient.invalidateQueries({
      queryKey: ['feed-posts']
    })

    // 4. Принудительно обновляем компонент
    setRefreshKey(prev => prev + 1)
  }, [propUserId, queryClient])



  if (isMeLoading || isProfileLoading) {
    return (
      <div className={s.loading}>
        <h3 className="h3">Загрузка профиля...</h3>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className={s.userNotFound}>
        <h3 className="h3">Профиль не найден</h3>
        <p>Не удалось получить данные для ID: {propUserId}</p>
      </div>
    )
  }

  return (
    <div className={s.container}>
      <ProfileHeader user={profile} isOwner={isOwner} />
      <PostFeed
        key={refreshKey}
        userId={propUserId}
        isOwner={isOwner}
        pageSize={8}
        handlePostClick={handlePostClick}
        useFeedEndpoint={isOwner}
      />

      {selectedPostId && (
        <PostModal
          postId={selectedPostId}
          initialPost={serverPost}
          isOpen={!!selectedPostId}
          onClose={handlePostModalClose}
          isOwnProfile={isOwner}
          userId={propUserId}
          currentUser={me}
          from={postFrom}
          onEditSuccess={handlePostUpdate}
          onDeleteSuccess={handlePostUpdate}
        />
      )}
    </div>
  )
}
