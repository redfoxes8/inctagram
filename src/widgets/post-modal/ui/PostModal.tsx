"use client"

import { VisuallyHidden } from "@radix-ui/themes"
import { useCallback, useMemo } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { toast } from "sonner"
import { Icon } from "@/shared/ui/Icon"
import s from "./PostModal.module.css"
import { PostItem } from "@/entities/post/model/post.types"
import { SchemaUserMeResponseDto } from "@/shared/api/schema"
import type { ProfileResponse } from "@/entities/user/model/profile.type"
import { usePostQuery } from "@/entities/post/api/use-post"
import { PostContent } from "./PostContent"
import { PostSkeleton } from "./PostSkeleton"

type PostModalProps = {
  postId?: string
  onClose?: () => void
  isOpen: boolean
  onEditSuccess?: (ownerId?: string) => void
  onDeleteSuccess?: (ownerId?: string) => void
  initialPost?: PostItem | null
  currentUser?: SchemaUserMeResponseDto | null
  authorProfile?: ProfileResponse | null
}

export const PostModal = ({
  postId,
  onClose,
  isOpen,
  onEditSuccess,
  onDeleteSuccess,
  initialPost,
  currentUser,
  authorProfile,
}: PostModalProps) => {
  const hasInitialPost = Boolean(initialPost && initialPost.id === postId)

  const {
    data: post,
    isLoading,
    error,
    refetch,
  } = usePostQuery(postId, {
    enabled: isOpen && !hasInitialPost,
    initialData: hasInitialPost ? (initialPost ?? undefined) : undefined,
  })

  const open = Boolean(postId && isOpen)

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  const isPostOwner = Boolean(currentUser && post && currentUser.userId === post.ownerId)

  const editData = useMemo(() => {
    if (!post || !currentUser || !isPostOwner) return undefined
    return {
      user: currentUser,
      post: post,
    }
  }, [post, currentUser, isPostOwner])

  const handlePostEditSuccess = useCallback(async () => {
    try {
      await refetch()
    } catch {
      toast.error("Failed to refresh the post")
      return
    }
    onEditSuccess?.(post?.ownerId)
  }, [refetch, onEditSuccess, post?.ownerId])

  const handlePostDeleteSuccess = useCallback(() => {
    handleClose()
    onDeleteSuccess?.(post?.ownerId)
  }, [handleClose, onDeleteSuccess, post?.ownerId])

  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={s.overlay} />
        <Dialog.Content className={s.dialogContent}>
          <VisuallyHidden asChild>
            <Dialog.Title>Пост</Dialog.Title>
          </VisuallyHidden>

          <VisuallyHidden asChild>
            <Dialog.Description>Просмотр поста c изображением</Dialog.Description>
          </VisuallyHidden>

          <Dialog.Close asChild>
            <button type="button" className={s.closeButton} aria-label="Close">
              <Icon name="close-outline" />
            </button>
          </Dialog.Close>

          <div className={s.container}>
            {isLoading ? (
              <PostSkeleton />
            ) : error || !post ? (
              <div className={s.error}>
                <p>{error ? "Failed to load post" : "Post not found"}</p>
                <button type="button" onClick={handleClose}>
                  Close
                </button>
              </div>
            ) : (
              <PostContent
                key={post.id}
                post={post}
                currentUser={currentUser}
                isPostOwner={isPostOwner}
                editData={editData}
                authorProfile={authorProfile}
                onEditSuccess={handlePostEditSuccess}
                onDeleteSuccess={handlePostDeleteSuccess}
                onClose={handleClose}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
