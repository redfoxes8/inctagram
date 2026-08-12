"use client"

import Image from "next/image"
import { Icon } from "@/shared/ui/Icon"
import clsx from "clsx"
import s from "./PostModal.module.css"

type PostImageProps = {
  imageUrl: string | null
  currentImageIndex: number
  hasMultipleImages: boolean
  totalImages: number
  onPrev: (e: React.MouseEvent) => void
  onNext: (e: React.MouseEvent) => void
  onDotClick: (index: number) => (e: React.MouseEvent) => void
}

export const PostImage = ({
  imageUrl,
  currentImageIndex,
  hasMultipleImages,
  totalImages,
  onPrev,
  onNext,
  onDotClick,
}: PostImageProps) => {
  if (!imageUrl) {
    return (
      <div className={s.imagePlaceholder}>
        <Icon name="image-outline" />
      </div>
    )
  }

  return (
    <div className={s.imageWrapper}>
      <Image
        src={imageUrl}
        alt={`Post image ${currentImageIndex + 1}`}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
        className={s.image}
      />
      
      {hasMultipleImages && currentImageIndex > 0 && (
        <button
          type="button"
          className={clsx(s.arrowBtn, s.arrowLeft)}
          onClick={onPrev}
          aria-label="Previous image"
        >
          <Icon name="arrow-ios-back-outline" />
        </button>
      )}

      {hasMultipleImages && currentImageIndex < totalImages - 1 && (
        <button
          type="button"
          className={clsx(s.arrowBtn, s.arrowRight)}
          onClick={onNext}
          aria-label="Next image"
        >
          <Icon name="arrow-ios-forward-outline" />
        </button>
      )}

      {hasMultipleImages && (
        <div className={s.dotsContainer}>
          {Array.from({ length: totalImages }).map((_, index) => (
            <button
              key={index}
              type="button"
              className={clsx(s.dot, index === currentImageIndex && s.dotActive)}
              onClick={onDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}