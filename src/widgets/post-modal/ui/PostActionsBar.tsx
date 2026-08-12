
"use client"

import { Icon } from "@/shared/ui/Icon"
import s from "./PostModal.module.css"

type PostActionsBarProps = {
  isLiked: boolean
  isSaved: boolean
  isSend: boolean
  onLike: () => void
  onSend: () => void
  onSave: () => void
  isDisabled: boolean
}

export const PostActionsBar = ({
  isLiked,
  isSaved,
  isSend,
  onLike,
  onSend,
  onSave,
  isDisabled,
}: PostActionsBarProps) => {
  return (
    <div className={s.actionButtons}>
      <div className={s.actionButtonsGroup}>
        <button
          type="button"
          onClick={onLike}
          disabled={isDisabled}
          className={s.actionButton}
          aria-label={isLiked ? "Unlike" : "Like"}
        >
          <Icon name={isLiked ? "heart" : "heart-outline"} />
        </button>
        <button
          type="button"
          onClick={onSend}
          disabled={isDisabled}
          className={s.actionButton}
          aria-label="Share"
        >
          <Icon name={isSend ? "paper-plane" : "paper-plane-outline"} />
        </button>
      </div>
      <button
        type="button"
        onClick={onSave}
        disabled={isDisabled}
        className={s.actionButton}
        aria-label={isSaved ? "Unsave" : "Save"}
      >
        <Icon name={isSaved ? "bookmark" : "bookmark-outline"} />
      </button>
    </div>
  )
}