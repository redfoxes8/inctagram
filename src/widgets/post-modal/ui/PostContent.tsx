"use client"

import { useCallback, useState } from "react"
import { PostItem } from "@/entities/post/model/post.types"
import { SchemaUserMeResponseDto } from "@/shared/api/schema"
import { CommentForm } from "./CommentForm"
import { PostActionsBar } from "./PostActionsBar"
import { PostDescription } from "./PostDescription"
import { PostHeader } from "./PostHeader"
import { PostImage } from "./PostImage"
import { usePostAuthor } from "@/entities/post/lib/hooks/usePostAuthor"
import { useImageNavigation } from "@/entities/post/lib/hooks/useImageNavigation"
import { formatCommentDate, formatPostDate } from "@/shared/lib/utils/dateFormatters"
import type { EditPostData } from "@/features/posts/edit-post/model/edit-post.types"
import s from "./PostModal.module.css"

type PostContentProps = {
  post: PostItem
  currentUser?: SchemaUserMeResponseDto | null
  isOwnProfile: boolean
  isPostOwner: boolean
  editData?: EditPostData
  onEditSuccess: () => void
  onDeleteSuccess: () => void
  onClose: () => void
}

export const PostContent = ({
  post,
  currentUser,
  isOwnProfile,
  isPostOwner,
  editData,
  onEditSuccess,
  onDeleteSuccess,
  onClose,
}: PostContentProps) => {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const { authorName, authorAvatar } = usePostAuthor(post, currentUser)
  const { currentImage, currentImageIndex, hasMultipleImages, totalImages, handlePrev, handleNext, handleDotClick } =
    useImageNavigation(post.images)

  const maxLength = 500

  const handleLike = useCallback(() => {
    if (!currentUser) return
    setIsLiked((prev) => !prev)
  }, [currentUser])

  const handleSend = useCallback(async () => {
    if (!post) return

    const shareUrl = post.ownerId
      ? `${window.location.origin}/profile/${post.ownerId}?postId=${post.id}`
      : `${window.location.origin}/?postId=${post.id}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.description || "Check out this post!",
          text: post.description || "",
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Share error:", error)
      }
    }
  }, [post])

  const handleSave = useCallback(() => {
    if (!currentUser) return
    setIsSaved((prev) => !prev)
  }, [currentUser])

  return (
    <div className={s.contentWrapper}>
      <div className={s.imageBlock}>
        <PostImage
          imageUrl={currentImage}
          currentImageIndex={currentImageIndex}
          hasMultipleImages={hasMultipleImages}
          totalImages={totalImages}
          onPrev={handlePrev}
          onNext={handleNext}
          onDotClick={handleDotClick}
        />
      </div>

      <div className={s.rightSide}>
        <PostHeader
          authorName={authorName}
          authorAvatar={authorAvatar}
          isOwnProfile={isOwnProfile}
          isPostOwner={isPostOwner}
          editData={editData}
          postId={post.id}
          onEditSuccess={onEditSuccess}
          onDeleteSuccess={onDeleteSuccess}
        />

        {post.description && (
          <PostDescription
            authorName={authorName}
            authorAvatar={authorAvatar}
            description={post.description}
            createdAt={post.createdAt}
            formatDate={formatCommentDate}
          />
        )}

        <PostActionsBar
          isLiked={isLiked}
          isSaved={isSaved}
          onLike={handleLike}
          onSend={handleSend}
          onSave={handleSave}
          isDisabled={!currentUser}
        />

        <div className={s.dateInfo}>
          <span className="small_text">{formatPostDate(post.createdAt)}</span>
        </div>

        <CommentForm currentUser={currentUser} maxLength={maxLength} />
      </div>
    </div>
  )
}
