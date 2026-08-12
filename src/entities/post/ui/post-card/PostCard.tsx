"use client"

import { useState } from "react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import clsx from "clsx"
import { Icon } from "@/shared/ui/Icon"
import s from "./PostCard.module.css"
import { useRouter } from "next/navigation"
import { PostItem } from "@/entities/post/model/post.types"

export type PostCardProps = {
  post: PostItem
  onPostClick?: (postId: string) => void
  variant?: 'feed' | 'profile' | 'grid'
  showAuthor?: boolean 
  showDescription?: boolean 
}

export const PostCard = ({ 
  post, 
  onPostClick, 
  variant = 'feed',
  showAuthor = true,
  showDescription = true,
}: PostCardProps) => {
  const navigate = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  const imagesList = post.images || []
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

  const handlePostClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPostClick?.(post.id)
  }

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const targetId = post.owner?.id || post.ownerId

    if (!targetId) {
      console.warn("Не удалось найти ID пользователя:", {
        ownerId: post.ownerId,
        owner: post.owner,
      })
      return
    }

    navigate.push(`/profile/${targetId}`)
  }

  const TEXT_LIMIT = 90
  const isLongText = (post.description?.length ?? 0) > TEXT_LIMIT

  const renderDescription = () => {
    const description = post.description || ""

    if (!showDescription) return null

    if (!isLongText) return <p className="regular_text 14">{description}</p>

    if (isExpanded) {
      return (
        <p className="regular_text 14">
          {description}{" "}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(false)
            }}
            className={s.toggle_text_btn}
          >
            <span className="regular_link">Hide</span>
          </button>
        </p>
      )
    }

    return (
      <p className="regular_text 14">
        {description.slice(0, TEXT_LIMIT)}...{" "}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(true)
          }}
          className={s.toggle_text_btn}
        >
          <span className="regular_link">Show more</span>
        </button>
      </p>
    )
  }

  const formattedTime = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }).replace("about ", "")
    : ""

  if (variant === 'grid' || variant === 'profile') {
    const image = imagesList[0]
    if (!image?.url) {
      return (
        <div className={clsx(s.card, s.emptyCard)}>
          No image
        </div>
      )
    }

    return (
      <div
        className={clsx(s.card, s.gridCard)}
        role="button"
        tabIndex={0}
        onClick={handlePostClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handlePostClick(e as any)
          }
        }}
      >
        <div className={s.imageWrapper}>
          <Image
            src={image.url}
            alt={post.description ?? "Post image"}
            fill
            priority
            sizes="(max-width:768px) 100vw, 50vw"
            className={s.image}
          />
        </div>
      </div>
    )
  }

  // Вариант для ленты (полный вид)
  return (
    <article className={s.card} onClick={handlePostClick}>
      <div className={s.media_side}>
        <div className={s.image_container}>
          {imagesList.length > 0 ? (
            <Image
              src={imagesList[currentImageIndex]?.url || ""}
              alt={`Post content ${currentImageIndex + 1}`}
              className={s.main_image}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
              priority={currentImageIndex === 0}
            />
          ) : (
            <div className={s.image_placeholder}>No Image</div>
          )}
        </div>

        {hasMultipleImages && currentImageIndex > 0 && (
          <button
            type="button"
            className={clsx(s.arrow_btn, s.arrow_left)}
            onClick={handlePrevImage}
            aria-label="Previous image"
          >
            <Icon name="arrow-ios-back-outline" />
          </button>
        )}

        {hasMultipleImages && currentImageIndex < imagesList.length - 1 && (
          <button
            type="button"
            className={clsx(s.arrow_btn, s.arrow_right)}
            onClick={handleNextImage}
            aria-label="Next image"
          >
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
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImageIndex(index)
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className={s.info_side}>
        {showAuthor && (
          <div className={s.profile_header} onClick={handleProfileClick}>
            <div className={s.avatar_wrapper}>
              {post.owner?.avatarUrl ? (
                <Image 
                  src={post.owner.avatarUrl} 
                  alt="avatar" 
                  className={s.avatar} 
                  width={40} 
                  height={40} 
                />
              ) : (
                <div className={s.avatar_placeholder} />
              )}
            </div>
            <span className="h3">{post.owner?.username || "UserName"}</span>
          </div>
        )}

        <span className={s.time_stamp}>{formattedTime}</span>

        {renderDescription()}
      </div>
    </article>
  )
}