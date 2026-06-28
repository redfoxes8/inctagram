"use client"

import Image from "next/image"
import clsx from "clsx"
import { SchemaPostResponseDto } from "@/shared/api/schema"
import s from "./PostCard.module.css"
import cat from "../../../../../public/Cat.jpg"
import { useState } from "react"

type PostCardProps = {
  post: SchemaPostResponseDto
  isOwner?: boolean
  className?: string
  onPostClick?: (postId: string) => void
}

export const PostCard = ({ post, onPostClick, className }: PostCardProps) => {
  const mainImage = post.images?.[0]
  const [imageSrc, setImageSrc] = useState(mainImage?.url || "")

  if (!mainImage?.url) {
    return <div className={clsx(s.card, s.emptyCard, className)}>No image</div>
  }

  return (
    <div
      className={clsx(s.card, className)}
      onClick={() => onPostClick?.(post.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onPostClick?.(post.id)
        }
      }}
    >
      <div className={s.imageWrapper}>
        <Image
          src={imageSrc}
          alt={post.description || "Post image"}
          fill
          // unoptimized  // ✅ Добавьте, чтобы избежать оптимизации
          // onError={(e) => {
          //     // ✅ Показываем котика при ошибке
          //     e.currentTarget.src = cat.src;
          // }}
          sizes="(max-width: 768px) 100vw, 50vw"
          className={s.image}
          priority
        />
      </div>
    </div>
  )
}
