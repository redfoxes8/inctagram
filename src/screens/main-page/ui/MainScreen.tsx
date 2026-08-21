"use client"

import { Suspense, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PostModal } from "@/widgets/post-modal/ui"
import { useMeQuery } from "@/features/auth/api/use-me"
import { revalidateAllPosts } from "@/shared/api/actions"
import { queryClient } from "@/shared/api/query-client"
import s from "./MainScreen.module.css"
import type { PostItem, UsersCountResponse } from "@/entities/post/model/post.types"
import { PostCard } from "@/entities/post/ui"

type MainScreenProps = {
  totalUsers: UsersCountResponse
  serverPosts: PostItem[]
}

function MainContent({ totalUsers, serverPosts }: MainScreenProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: currentUser } = useMeQuery()

  const postId = searchParams.get("postId")

  const initialPost = useMemo(() => {
    if (!postId) return null
    const found = serverPosts.find((post) => post.id === postId)
    return found || null
  }, [postId, serverPosts])
  const handlePostClick = useCallback(
    (postId: string) => {
      router.push(`/?postId=${postId}`, { scroll: false })
    },
    [router],
  )

  const handleCloseModal = useCallback(() => {
    router.push("/", { scroll: false })
  }, [router])

  const handlePostChanged = useCallback(
    async (ownerId?: string) => {
      await revalidateAllPosts(ownerId)
      router.refresh()

      await queryClient.invalidateQueries({ queryKey: ["posts"], refetchType: "all" })
      await queryClient.invalidateQueries({ queryKey: ["post"], refetchType: "all" })

      if (ownerId) {
        await queryClient.invalidateQueries({ queryKey: ["profile", ownerId], refetchType: "all" })
      }
    },
    [router],
  )

  const digits = String(totalUsers.totalCount).padStart(6, "0").split("")

  return (
    <div className={s.wrapper}>
      <div className={s.head}>
        <span className="h2">Registered users: </span>
        <div className={s.counter}>
          {digits.map((digit, index) => (
            <div key={index} className={s.digitBox}>
              <span className="h2">{digit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={s.content}>
        {serverPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPostClick={handlePostClick}
            variant="feed"
            showAuthor={true}
            showDescription={true}
          />
        ))}
      </div>

      {postId && (
        <PostModal
          postId={postId}
          isOpen={!!postId}
          onClose={handleCloseModal}
          currentUser={currentUser}
          initialPost={initialPost}
          onEditSuccess={handlePostChanged}
          onDeleteSuccess={handlePostChanged}
        />
      )}
    </div>
  )
}

export function MainScreen(props: MainScreenProps) {
  return (
    <Suspense fallback={<div className={s.loading}>Loading...</div>}>
      <MainContent {...props} />
    </Suspense>
  )
}
