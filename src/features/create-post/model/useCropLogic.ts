import { useState, useRef, useCallback } from "react"
import { useCreatePostStore } from "../model/store"

type AspectType = "Original" | "1:1" | "4:5" | "16:9"

export const useCropLogic = (imageIndex: number) => {
  const { data, updateImageItem } = useCreatePostStore()
  const currentItem = data.images[imageIndex]

  const [aspect, setAspect] = useState<AspectType>(currentItem?.cropArea?.aspect || "Original")
  const [zoom, setZoom] = useState<number>(currentItem?.cropArea?.zoom || 1)
  const [position, setPosition] = useState({
    x: currentItem?.cropArea?.positionX || 0,
    y: currentItem?.cropArea?.positionY || 0,
  })
  const [isDragging, setIsDragging] = useState(false)

  const dragStart = useRef({ x: 0, y: 0 })
  const cropContainerRef = useRef<HTMLDivElement>(null)
  const cropFrameRef = useRef<HTMLDivElement>(null)

  const applyCropAndSave = useCallback(async () => {
    if (!currentItem?.originalImage) return

    const img = new Image()
    img.src = currentItem.originalImage

    await new Promise((resolve) => {
      img.onload = resolve
    })

    const frameElement = cropFrameRef.current
    if (!frameElement) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let croppedBase64 = ""

    if (aspect === "Original") {
      canvas.width = img.width
      canvas.height = img.height
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, img.width, img.height)
      croppedBase64 = canvas.toDataURL("image/jpeg", 0.95)
    } else {
      const frameRect = frameElement.getBoundingClientRect()
      const cropWidth = frameRect.width
      const cropHeight = frameRect.height

      canvas.width = cropWidth
      canvas.height = cropHeight

      const imgAspect = img.width / img.height
      const cropAspect = cropWidth / cropHeight

      let displayWidth = cropWidth
      let displayHeight = cropHeight
      if (imgAspect > cropAspect) {
        displayWidth = cropHeight * imgAspect
      } else {
        displayHeight = cropWidth / imgAspect
      }

      const baseOffsetX = (cropWidth - displayWidth) / 2
      const baseOffsetY = (cropHeight - displayHeight) / 2

      const finalDisplayWidth = displayWidth * zoom
      const finalDisplayHeight = displayHeight * zoom
      const finalOffsetX = baseOffsetX + position.x - (finalDisplayWidth - displayWidth) / 2
      const finalOffsetY = baseOffsetY + position.y - (finalDisplayHeight - displayHeight) / 2

      const sx = -finalOffsetX * (img.width / finalDisplayWidth)
      const sy = -finalOffsetY * (img.height / finalDisplayHeight)
      const sWidth = cropWidth * (img.width / finalDisplayWidth)
      const sHeight = cropHeight * (img.height / finalDisplayHeight)

      ctx.clearRect(0, 0, cropWidth, cropHeight)
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, cropWidth, cropHeight)
      croppedBase64 = canvas.toDataURL("image/jpeg", 0.95)
    }

    updateImageItem(imageIndex, {
      croppedImage: croppedBase64,
      cropArea: {
        aspect,
        zoom: aspect === "Original" ? 1 : zoom,
        positionX: aspect === "Original" ? 0 : position.x,
        positionY: aspect === "Original" ? 0 : position.y,
      },
    })
  }, [currentItem?.originalImage, aspect, zoom, position, imageIndex, updateImageItem])

  const handleAspectChange = async (newAspect: AspectType) => {
    setAspect(newAspect)
    setPosition({ x: 0, y: 0 })
    setZoom(1)
    setTimeout(() => applyCropAndSave(), 60)
  }

  const handleZoomChange = async (newZoom: number) => {
    if (aspect === "Original") return
    setZoom(newZoom)
    setTimeout(() => applyCropAndSave(), 50)
  }

  const handlePositionChange = async (newPosition: { x: number; y: number }) => {
    if (aspect === "Original") return
    setPosition(newPosition)
    setTimeout(() => applyCropAndSave(), 50)
  }

  return {
    aspect,
    zoom,
    position,
    isDragging,
    dragStart,
    cropContainerRef,
    cropFrameRef,
    setAspect: handleAspectChange,
    setZoom: handleZoomChange,
    setPosition: handlePositionChange,
    setIsDragging,
    applyCropAndSave,
  }
}
