
"use client"

import * as Avatar from "@radix-ui/react-avatar"
import { Icon } from "@/shared/ui/Icon"
import clsx from "clsx"
import s from "./PostModal.module.css"

type PostDescriptionProps = {
  authorName: string
  authorAvatar?: string
  description: string
  createdAt: string
  formatDate: (date: string) => string
}

export const PostDescription = ({
  authorName,
  authorAvatar,
  description,
  createdAt,
  formatDate,
}: PostDescriptionProps) => {
  return (
    <div className={s.commentBlock}>
      <div className={s.commentPost}>
        <Avatar.Root className={s.avatarRoot}>
          <Avatar.Image src={authorAvatar} alt={authorName} className={s.avatarImage} />
          <Avatar.Fallback className={s.avatarFallback}>
            <Icon name="person-outline" />
          </Avatar.Fallback>
        </Avatar.Root>
        <div className={s.commentBody}>
          <span className={clsx("h3", s.userName)}>{authorName}</span>
          <span className="regular_text_16">{description}</span>
        </div>
      </div>

      <div className={s.dateInfoPost}>
        <span className="small_text">{formatDate(createdAt)}</span>
      </div>
    </div>
  )
}