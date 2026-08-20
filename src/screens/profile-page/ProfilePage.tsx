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
import { PostItem } from "@/entities/post/model/post.types"
import { revalidateFeed, revalidateProfile } from "@/shared/api/actions"
import { queryClient } from "@/shared/api/query-client"

export type ProfilePageProps = {
  userId: string
  postId?: string
  serverProfile: ProfileResponse
  serverPost?: PostItem | null
}

export const ProfilePage = ({
  userId: propUserId,
  postId: initialPostId,
  serverProfile,
  serverPost,
}: ProfilePageProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { data: me } = useMeQuery()

  const { data: profile } = useProfileQuery({
    userId: propUserId,
    initialData: serverProfile,
  })

  const isOwner = Boolean(me?.userId && propUserId && me.userId === propUserId)

  const selectedPostId = searchParams.get("postId") || initialPostId || undefined

  const postFrom = selectedPostId ? (initialPostId ? "profile" : "direct") : undefined

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
    await revalidateProfile(propUserId)
    await revalidateFeed()

    await queryClient.invalidateQueries({
      queryKey: ["posts"],
    })
  }, [propUserId])

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
