"use client"

import { useFeedPosts } from "@/entities/post/api/use-feed-posts"
import { useMeQuery } from "@/features/auth/api/use-me"
import { Spinner } from "@radix-ui/themes"
import Image from "next/image"
import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"
import * as Avatar from "@radix-ui/react-avatar"
import { Icon } from "@/shared/ui/Icon"
import { Button, TextArea } from "@/shared/ui"
import clsx from "clsx"
import s from "./PostModal.module.css"
import { PostActions } from "@/widgets/post-actions/ui/PostActions"

type PostModalProps = {
  postId?: string
  onClose?: () => void
  isOpen: boolean
  isOwnProfile: boolean
  onEditSuccess?: () => void
  onDeleteSuccess?: () => void
}

type Comment = {
  id: string
  userName: string
  userAvatar?: string
  text: string
  createdAt: string
}

export const PostModal = ({
  postId,
  onClose,
  isOpen,
  isOwnProfile,
  onEditSuccess,
  onDeleteSuccess,
}: PostModalProps) => {
  const { data: currentUser } = useMeQuery()
  const router = useRouter()

  const [description, setDescription] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])

  const maxLength = 500

  const { data, isLoading, error, refetch } = useFeedPosts({
    pageSize: 100,
    enabled: isOpen && !!postId,
  })

  const post = useMemo(() => {
    if (!data) return null
    const allPosts = data.pages.flatMap((page) => page.posts || [])
    return allPosts.find((p) => p.id === postId) || null
  }, [data, postId])

  const handleClose = useCallback(() => {
    if (onClose) onClose()
    else router.back()
  }, [onClose, router])

  const open = Boolean(postId) && isOpen

  const imageUrl = post?.images?.[0]?.url ?? null
  const avatarUrl = currentUser?.avatarUrl
  const userName = currentUser?.username || "User"
  const likesCount = 123

  const handleLike = useCallback(() => setIsLiked((v) => !v), [])
  const handleSave = useCallback(() => setIsSaved((v) => !v), [])

  const handlePublishComment = useCallback(() => {
    if (!description.trim()) return

    const newComment: Comment = {
      id: Date.now().toString(),
      userName,
      userAvatar: avatarUrl || undefined,
      text: description.trim(),
      createdAt: new Date().toISOString(),
    }

    setComments((prev) => [newComment, ...prev])
    setDescription("")
  }, [description, userName, avatarUrl])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }, [])

  const handlePostEditSuccess = useCallback(() => {
    refetch()
    onEditSuccess?.()
  }, [refetch, onEditSuccess])

  const handlePostDeleteSuccess = useCallback(() => {
    handleClose()
    onDeleteSuccess?.()
  }, [handleClose, onDeleteSuccess])

  const editData = useMemo(() => {
    if (!post || !currentUser || !isOwnProfile) return undefined

    return {
      user: currentUser,
      post: post,
    }
  }, [post, currentUser, isOwnProfile])
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={s.overlay} />

        <Dialog.Content className={s.dialogContent}>
          <Dialog.Close asChild>
            <button className={s.closeButton} onClick={handleClose}>
              <Icon name="close-outline" />
            </button>
          </Dialog.Close>

          {isLoading && (
            <div className={s.loader}>
              <Spinner size="3" />
              <span>Loading...</span>
            </div>
          )}

          {error && (
            <div className={s.error}>
              <p>Failed to load posts</p>
              <button onClick={() => refetch()}>Try again</button>
              <button onClick={handleClose}>Close</button>
            </div>
          )}

          {!isLoading && !error && !post && (
            <div className={s.error}>
              <p>Post not found</p>
              <button onClick={handleClose}>Close</button>
            </div>
          )}

          {!isLoading && !error && post && (
            <div className={s.container}>
              <div className={s.contentWrapper}>
                {/* Image Block */}
                <div className={s.imageBlock}>
                  {imageUrl ? (
                    <div className={s.imageWrapper}>
                      <Image
                        src={imageUrl}
                        alt="Post image"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                        className={s.image}
                      />
                    </div>
                  ) : (
                    <div className={s.imagePlaceholder}>
                      <Icon name="image-outline" />
                    </div>
                  )}
                </div>

                {/* Right Side */}
                <div className={s.rightSide}>
                  {/* User Header with Actions */}
                  <div className={s.user}>
                    <div className={s.userInfo}>
                      <Avatar.Root className={s.avatarRoot}>
                        <Avatar.Image src={avatarUrl ?? undefined} alt={userName} className={s.avatarImage} />
                        <Avatar.Fallback className={s.avatarFallback}>
                          <Icon name="person-outline" />
                        </Avatar.Fallback>
                      </Avatar.Root>

                      <span className={clsx(s.userName, "h3")}>{userName}</span>
                    </div>

                    {isOwnProfile && editData && (
                      <PostActions
                        postId={post.id}
                        isOwner={isOwnProfile}
                        editData={editData}
                        onEditSuccess={handlePostEditSuccess}
                        onDeleteSuccess={handlePostDeleteSuccess}
                        triggerClassName={s.actionsTrigger}
                        align="end"
                      />
                    )}
                  </div>

                  {/* Description */}
                  {post.description && (
                    <div className={s.existingDescription}>
                      <span className={clsx(s.userName, "h3")}>{userName}</span>
                      <span className="regular_text_16">{post.description}</span>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className={s.commentsList}>
                    {comments.length === 0 && <p className={s.noComments}>No comments yet. Be the first!</p>}
                    {comments.map((c) => (
                      <div key={c.id} className={s.commentItem}>
                        <Avatar.Root className={s.commentAvatarRoot}>
                          <Avatar.Image src={c.userAvatar} className={s.commentAvatarImage} alt={c.userName} />
                          <Avatar.Fallback />
                        </Avatar.Root>

                        <div className={s.commentContent}>
                          <span className={s.commentUserName}>{c.userName}</span>
                          <span className={s.commentText}>{c.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className={s.actionButtons}>
                    <Button onClick={handleLike} variant="ghost">
                      <Icon name={isLiked ? "heart" : "heart-outline"} />
                      <span>{likesCount}</span>
                    </Button>

                    <Button onClick={handleSave} variant="ghost">
                      <Icon name={isSaved ? "bookmark" : "bookmark-outline"} />
                    </Button>
                  </div>

                  {/* Date */}
                  <div className={s.dateInfo}>
                    <span className="small_text">{formatDate(post.createdAt)}</span>
                  </div>

                  {/* Comment Input */}
                  <div className={s.textarea}>
                    <TextArea
                      value={description}
                      onChange={(e) => setDescription(e.target.value.slice(0, maxLength))}
                      placeholder="Add a comment..."
                      rows={3}
                    />
                    <div className={s.textareaActions}>
                      <span className={s.charCount}>
                        {description.length}/{maxLength}
                      </span>
                      <Button onClick={handlePublishComment} disabled={!description.trim()}>
                        Publish
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
