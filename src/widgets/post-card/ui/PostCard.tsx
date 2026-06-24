"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import clsx from "clsx"
import { Icon } from "@/shared/ui/Icon"
import s from "./PostCard.module.css"

interface PostImage {
  id: string
  fileId: string
  url: string
  order: number
}

interface PostOwner {
  id: string
  username: string
  avatarUrl?: string
}

export type PostCardProps = {
  post: {
    id: string
    ownerId: string
    description: string
    images: PostImage | PostImage[]
    createdAt: string
    updatedAt: string
    owner?: PostOwner
  }
}

export const PostCard = ({ post }: PostCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  const imagesList = Array.isArray(post.images) ? post.images : post.images ? [post.images] : []
  const hasMultipleImages = imagesList.length > 1

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1)
    }
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentImageIndex < imagesList.length - 1) {
      setCurrentImageIndex((prev) => prev + 1)
    }
  }

  const TEXT_LIMIT = 90
  const isLongText = post.description.length > TEXT_LIMIT

  const renderDescription = () => {
    if (!isLongText) return post.description

    if (isExpanded) {
      return (
        <>
          {post.description}{" "}
          <button onClick={() => setIsExpanded(false)} className={s.toggle_text_btn}>
            <span className="regular_link">Hide</span>
          </button>
        </>
      )
    }

    return (
      <>
        {post.description.slice(0, TEXT_LIMIT)}...{" "}
        <button onClick={() => setIsExpanded(true)} className={s.toggle_text_btn}>
          <span className="regular_link">Show more</span>
        </button>
      </>
    )
  }

  const formattedTime = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }).replace("about ", "")
    : ""

  return (
    <article className={s.card}>
      <div className={s.media_side}>
        <div className={s.image_container}>
          {imagesList.length > 0 ? (
            <img
              src={imagesList[currentImageIndex]?.url}
              alt={`Post content ${currentImageIndex + 1}`}
              className={s.main_image}
              loading="lazy"
            />
          ) : (
            <div className={s.image_placeholder}>No Image</div>
          )}
        </div>

        {currentImageIndex > 0 && (
          <button type="button" className={clsx(s.arrow_btn, s.arrow_left)} onClick={handlePrevImage}>
            <Icon name="arrow-ios-back-outline" />
          </button>
        )}

        {currentImageIndex < imagesList.length - 1 && (
          <button type="button" className={clsx(s.arrow_btn, s.arrow_right)} onClick={handleNextImage}>
            <Icon name="arrow-ios-forward" />
          </button>
        )}

        {hasMultipleImages && (
          <div className={s.dots_container}>
            {imagesList.map((_, index) => (
              <button
                key={index}
                type="button"
                className={clsx(s.dot, index === currentImageIndex && s.dot_active)}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className={s.info_side}>
        <div className={s.profile_header}>
          <div className={s.avatar_wrapper}>
            {post.owner?.avatarUrl ? (
              <img src={post.owner.avatarUrl} alt="avatar" className={s.avatar} />
            ) : (
              <div className={s.avatar_placeholder} />
            )}
          </div>
          <span className="h3">{post.owner?.username || "UserName"}</span>
        </div>

        <span className={s.time_stamp}>{formattedTime}</span>

        <p className="regular_text 14">{renderDescription()}</p>
      </div>
    </article>
  )
}
