import { useState, useCallback, useEffect } from "react"
import type { PostImage } from "@/entities/post/model/post.types"

export const useImageNavigation = (images: PostImage[]) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const hasMultipleImages = images.length > 1
  const currentImage = images[currentImageIndex]?.url ?? null

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return
      }

      if (e.key === "ArrowLeft") {
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev))
        e.preventDefault()
      } else if (e.key === "ArrowRight") {
        setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev))
        e.preventDefault()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [images.length])

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }, [])

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev))
    },
    [images.length],
  )

  const handleDotClick = useCallback(
    (index: number) => (e: React.MouseEvent) => {
      e.stopPropagation()
      setCurrentImageIndex(index)
    },
    [],
  )

  return {
    currentImage,
    currentImageIndex,
    hasMultipleImages,
    totalImages: images.length,
    handlePrev,
    handleNext,
    handleDotClick,
  }
}
