"use client"

import Link from "next/link"
import { Button, TextArea } from "@/shared/ui"
import clsx from "clsx"
import s from "./PostModal.module.css"
import { SchemaUserMeResponseDto } from "@/shared/api/schema"

type CommentFormProps = {
  currentUser?: SchemaUserMeResponseDto | null
  description: string
  setDescription: (value: string) => void
  isSubmitting: boolean
  onSubmit: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  maxLength: number
}

export const CommentForm = ({
  currentUser,
  description,
  setDescription,
  isSubmitting,
  onSubmit,
  onKeyDown,
  maxLength,
}: CommentFormProps) => {
  if (!currentUser) {
    return (
      <div className={s.authRequired}>
        <p>Sign in to like, comment or save</p>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className={s.commentForm}
    >
      <TextArea
        className={clsx("regular_text 14", s.textComment)}
        style={{ background: 'var(--dark-300)' }}
        rows={1}
        aria-label="Add a comment…"
        maxLength={maxLength}
        value={description}
        placeholder="Add a comment..."
        onChange={(e) => setDescription(e.target.value.slice(0, maxLength))}
        onKeyDown={onKeyDown}
        disabled={isSubmitting}
      />
      <Button
        type="submit"
        variant="ghost"
        className={s.publishButton}
        disabled={!description.trim() || isSubmitting}
      >
        {isSubmitting ? "Publishing..." : "Publish"}
      </Button>
    </form>
  )
}
