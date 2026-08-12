"use client"

import { useState, useCallback } from "react"
import clsx from "clsx"
import s from "./PostModal.module.css"
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


type PostContentProps = {
  post: PostItem
  currentUser?: SchemaUserMeResponseDto | null
  isOwnProfile: boolean
  isPostOwner: boolean
  editData?: any
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
  const [isSend, setIsSend] = useState(false)
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { authorName, authorAvatar } = usePostAuthor(post, currentUser)
  const {
    currentImage,
    currentImageIndex,
    hasMultipleImages,
    totalImages,
    handlePrev,
    handleNext,
    handleDotClick,
  } = useImageNavigation(post?.images || [], post.id)

  const likesCount = 5
  const maxLength = 500

  const handleLike = useCallback(() => {
    if (!currentUser) return
    setIsLiked(prev => !prev)
  }, [currentUser])

  const handleSend = useCallback(async () => {
    if (!currentUser || !post) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.description || 'Check out this post!',
          text: post.description || '',
          url: `${window.location.origin}/?postId=${post.id}`,
        })
      } else {
        await navigator.clipboard.writeText(
          `${window.location.origin}/?postId=${post.id}`
        )
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share error:', error)
      }
    }
  }, [currentUser, post])

  const handleSave = useCallback(() => {
    if (!currentUser) return
    setIsSaved(prev => !prev)
  }, [currentUser])

  const handlePublishComment = useCallback(async () => {
    if (!currentUser || !description.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      console.log('Comment:', description.trim())
      setDescription("")
    } catch (err) {
      console.error('Failed to publish comment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }, [currentUser, description, isSubmitting])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (description.trim() && !isSubmitting) {
        handlePublishComment()
      }
    }
  }, [description, handlePublishComment, isSubmitting])

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
          isSend={isSend}
          onLike={handleLike}
          onSend={handleSend}
          onSave={handleSave}
          isDisabled={!currentUser}
        />

        <div className={clsx(s.totalLike, "regular_text 14")}>
          {likesCount} "Like"
        </div>

        <div className={s.dateInfo}>
          <span className="small_text">{formatPostDate(post.createdAt)}</span>
        </div>

        <CommentForm
          currentUser={currentUser}
          description={description}
          setDescription={setDescription}
          isSubmitting={isSubmitting}
          onSubmit={handlePublishComment}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
        />
      </div>
    </div>
  )
}