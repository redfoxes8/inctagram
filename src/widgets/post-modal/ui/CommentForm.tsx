"use client"

import { useState } from "react"
import Link from "next/link"
import { Button, TextArea } from "@/shared/ui"
import clsx from "clsx"
import s from "./PostModal.module.css"
import { SchemaUserMeResponseDto } from "@/shared/api/schema"

type CommentFormProps = {
  currentUser?: SchemaUserMeResponseDto | null
  maxLength: number
}

export const CommentForm = ({ currentUser, maxLength }: CommentFormProps) => {
  const [description, setDescription] = useState("")

  const clearInput = () => setDescription("")

  const handleSubmit = () => {
    if (!description.trim()) return
    clearInput()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

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
        handleSubmit()
      }}
      className={s.commentForm}
    >
      <TextArea
        className={clsx("regular_text 14", s.textComment)}
        rows={1}
        aria-label="Add a comment…"
        maxLength={maxLength}
        value={description}
        placeholder="Add a comment..."
        onChange={(e) => setDescription(e.target.value.slice(0, maxLength))}
        onKeyDown={handleKeyDown}
      />
      <Button type="submit" variant="ghost" className={s.publishButton} disabled={!description.trim()}>
        Publish
      </Button>
    </form>
  )
}
