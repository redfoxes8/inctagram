"use client"

import * as Avatar from "@radix-ui/react-avatar"
import { Icon } from "@/shared/ui/Icon"
import clsx from "clsx"
import s from "./PostModal.module.css"
import { PostActions } from "@/widgets/post-actions/ui/PostActions"
import type { EditPostData } from "@/features/posts/edit-post/model/edit-post.types"

type PostHeaderProps = {
  authorName: string
  authorAvatar?: string
  isOwnProfile: boolean
  isPostOwner: boolean
  editData?: EditPostData
  postId: string
  onEditSuccess: () => void
  onDeleteSuccess: () => void
}

export const PostHeader = ({
  authorName,
  authorAvatar,
  isOwnProfile,
  isPostOwner,
  editData,
  postId,
  onEditSuccess,
  onDeleteSuccess,
}: PostHeaderProps) => {
  return (
    <div className={s.user}>
      <div className={s.userInfo}>
        <Avatar.Root className={s.avatarRoot}>
          <Avatar.Image src={authorAvatar} alt={authorName} className={s.avatarImage} />
          <Avatar.Fallback className={s.avatarFallback}>
            <Icon name="person-outline" />
          </Avatar.Fallback>
        </Avatar.Root>
        <span className={clsx("h3", s.userName)}>{authorName}</span>
      </div>

      {(isOwnProfile || isPostOwner) && editData && (
        <PostActions
          postId={postId}
          isOwner={isPostOwner}
          editData={editData}
          triggerClassName={s.actionsTrigger}
          align="end"
          onEditSuccess={onEditSuccess}
          onDeleteSuccess={onDeleteSuccess}
        />
      )}
    </div>
  )
}
