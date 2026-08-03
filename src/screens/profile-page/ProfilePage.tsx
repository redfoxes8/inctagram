"use client"

import { useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ProfileHeader } from "@/widgets/profile-header"
import { PostFeed } from "@/widgets/post-feed"
import { PostModal } from "@/widgets/post-modal/ui"
import { useMeQuery } from "@/features/auth/api/use-me"
import { useProfileQuery } from "@/entities/user/api/use-profile"
import { ProfileResponse } from "@/entities/user/model/profile.type"
import s from "./ProfilePage.module.css"

export type ProfilePageProps = {
  userId: string
  postId?: string
  serverProfile: ProfileResponse
}

export const ProfilePage = ({ userId: propUserId, postId: initialPostId, serverProfile }: ProfilePageProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { data: me } = useMeQuery()
  const isOwner = Boolean(me?.userId && propUserId && me.userId === propUserId)

  const { data: profile, isLoading } = useProfileQuery({
    userId: propUserId,
    initialData: serverProfile,
  })

  const selectedPostId = searchParams.get("postId") || initialPostId || undefined

  const handlePostClick = useCallback(
    (postId: string) => {
      router.push(`${pathname}?postId=${postId}`, { scroll: false })
    },
    [pathname, router],
  )

  const handlePostModalClose = useCallback(() => {
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
        <h3 className="h3">Профиль не найден</h3>
        <p>Не удалось получить данные для ID: {propUserId}</p>
      </div>
    )
  }

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
