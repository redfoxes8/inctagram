
import { useState, useCallback, useEffect } from 'react'

export const useImageNavigation = (images: any[], postId: string) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const hasMultipleImages = images.length > 1
  const currentImage = images[currentImageIndex]?.url ?? null

  useEffect(() => {
    setCurrentImageIndex(0)
  }, [postId])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return
      }
      
      if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
        setCurrentImageIndex(prev => prev - 1)
        e.preventDefault()
      } else if (e.key === 'ArrowRight' && currentImageIndex < images.length - 1) {
        setCurrentImageIndex(prev => prev + 1)
        e.preventDefault()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentImageIndex, images.length])

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1)
    }
  }, [currentImageIndex])

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1)
    }
  }, [currentImageIndex, images.length])

  const handleDotClick = useCallback((index: number) => (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex(index)
  }, [])

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