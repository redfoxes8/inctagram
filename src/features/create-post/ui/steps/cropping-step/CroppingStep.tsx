"use client"

import { useState, useRef, MouseEvent, ChangeEvent, useEffect } from "react"
import clsx from "clsx"
import { Icon } from "@/shared/ui/Icon"
import s from "./CroppingStep.module.css"
import { useCreatePostStore } from "@/features/create-post/model/store"
import { useCropLogic } from "@/features/create-post/model/useCropLogic"

type AspectType = "Original" | "1:1" | "4:5" | "16:9"

export const CroppingStep = () => {
  const { data, setCurrentImageIndex } = useCreatePostStore()
  const { images, currentImageIndex } = data
  const currentItem = images[currentImageIndex]

  const [isAspectOpen, setIsAspectOpen] = useState(false)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  const {
    aspect,
    zoom,
    position,
    isDragging,
    dragStart,
    cropContainerRef,
    cropFrameRef,
    setAspect,
    setZoom,
    setPosition,
    setIsDragging,
    applyCropAndSave,
  } = useCropLogic(currentImageIndex)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    applyCropAndSave()

    return () => {
      applyCropAndSave()
    }
  }, [])

  if (!currentItem) return null

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (aspect === "Original") return
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || aspect === "Original") return
    const newPosition = {
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    }
    setPosition(newPosition)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleAddFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const newFiles = Array.from(e.target.files)
    const newImageItems = newFiles.map((file, index) => {
      const originalImage = URL.createObjectURL(file)
      return {
        id: `${file.name}-${index}-${Date.now()}`,
        file,
        originalImage,
        croppedImage: originalImage,
        cropArea: null,
        filter: null,
      }
    })

    useCreatePostStore.setState((state) => ({
      data: {
        ...state.data,
        images: [...state.data.images, ...newImageItems],
      },
    }))
  }

  const handleRemoveImage = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation()

    if (images[indexToRemove]?.originalImage) {
      URL.revokeObjectURL(images[indexToRemove].originalImage)
    }
    if (
      images[indexToRemove]?.croppedImage &&
      images[indexToRemove]?.croppedImage !== images[indexToRemove]?.originalImage
    ) {
      URL.revokeObjectURL(images[indexToRemove].croppedImage)
    }

    const filteredImages = images.filter((_, idx) => idx !== indexToRemove)

    if (filteredImages.length === 0) {
      useCreatePostStore.getState().reset()
      return
    }

    let nextIndex = currentImageIndex
    if (currentImageIndex >= filteredImages.length) {
      nextIndex = filteredImages.length - 1
    }

    useCreatePostStore.setState((state) => ({
      data: {
        ...state.data,
        images: filteredImages,
        currentImageIndex: nextIndex,
      },
    }))
  }

  const getAspectClass = () => {
    if (aspect === "Original") return s.crop_frame_original
    if (aspect === "4:5") return s.crop_frame_portrait
    if (aspect === "16:9") return s.crop_frame_landscape
    return s.crop_frame_square
  }

  const getImageStyle = () => {
    if (aspect === "Original") {
      return {
        width: "100%",
        height: "100%",
        objectFit: "contain" as const,
        transform: "none",
      }
    }

    return {
      transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
    }
  }

  return (
    <div className={s.container}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg, image/png, image/jpg, image/webp"
        className={s.hidden_input}
        onChange={handleAddFiles}
      />

      <div ref={cropContainerRef} className={s.viewport}>
        <div
          ref={cropFrameRef}
          className={clsx(s.crop_frame, getAspectClass())}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={currentItem.originalImage}
            alt="Crop target"
            className={clsx(s.source_image, aspect === "Original" && s.source_image_original)}
            style={getImageStyle()}
            draggable={false}
          />
        </div>
      </div>

      <div className={s.bottom_toolbar}>
        <div className={s.left_controls}>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className={clsx(s.icon_trigger, isAspectOpen && s.icon_trigger_active)}
              onClick={() => {
                setIsAspectOpen(!isAspectOpen)
                setIsZoomOpen(false)
                setIsGalleryOpen(false)
              }}
            >
              <Icon name="expand-outline" />
            </button>

            {isAspectOpen && (
              <div className={clsx(s.popover, s.aspect_popover)}>
                {(["Original", "1:1", "4:5", "16:9"] as AspectType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={clsx(s.aspect_btn, aspect === type && s.aspect_btn_active)}
                    onClick={() => {
                      setAspect(type)
                      setIsAspectOpen(false)
                    }}
                  >
                    <span>{type}</span>
                    <Icon name={aspect === type ? "radio_button_checked" : "radio_button_unchecked"} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {aspect !== "Original" && (
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className={clsx(s.icon_trigger, isZoomOpen && s.icon_trigger_active)}
                onClick={() => {
                  setIsZoomOpen(!isZoomOpen)
                  setIsAspectOpen(false)
                  setIsGalleryOpen(false)
                }}
              >
                <Icon name="maximize-outline" />
              </button>

              {isZoomOpen && (
                <div className={clsx(s.popover, s.zoom_popover)}>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className={s.slider}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className={s.right_controls}>
          {/* Gallery Button */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className={clsx(s.icon_trigger, isGalleryOpen && s.icon_trigger_active)}
              onClick={() => {
                setIsGalleryOpen(!isGalleryOpen)
                setIsAspectOpen(false)
                setIsZoomOpen(false)
              }}
            >
              <Icon name="image-outline" />
            </button>

            {isGalleryOpen && (
              <div className={s.gallery_popover}>
                {images.map((img, idx) => (
                  <div key={img.id} className={s.thumb_wrapper} onClick={() => setCurrentImageIndex(idx)}>
                    <img
                      src={img.croppedImage || img.originalImage}
                      alt="thumbnail"
                      className={clsx(s.thumb_img, idx === currentImageIndex && s.thumb_img_active)}
                    />
                    <button type="button" className={s.remove_thumb_btn} onClick={(e) => handleRemoveImage(e, idx)}>
                      ✕
                    </button>
                  </div>
                ))}

                <button type="button" className={s.add_photo_btn} onClick={() => fileInputRef.current?.click()}>
                  <Icon name="plus-square-outline" style={{ width: "24px", height: "24px" }} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
