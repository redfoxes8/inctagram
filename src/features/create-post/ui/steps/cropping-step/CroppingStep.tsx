"use client"

import { useState, useRef, MouseEvent, ChangeEvent } from "react"
import clsx from "clsx"
import { Icon } from "@/shared/ui/Icon"
import s from "./CroppingStep.module.css"
import { useCreatePostStore } from "@/features/create-post/model/store"

type AspectType = "1:1" | "4:5" | "16:9"

export const CroppingStep = () => {
  const { data, updateImageItem, setCurrentImageIndex } = useCreatePostStore()
  const { images, currentImageIndex } = data
  const currentItem = images[currentImageIndex]

  const [isAspectOpen, setIsAspectOpen] = useState(false)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  const [aspect, setAspect] = useState<AspectType>("1:1")
  const [zoom, setZoom] = useState<number>(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const dragStart = useRef({ x: 0, y: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!currentItem) return null

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleAddFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const newFiles = Array.from(e.target.files)
    const newImageItems = newFiles.map((file, index) => ({
      id: `${file.name}-${index}-${Date.now()}`,
      file,
      croppedImage: URL.createObjectURL(file),
      cropArea: null,
      filter: null,
    }))

    useCreatePostStore.setState((state) => ({
      data: {
        ...state.data,
        images: [...state.data.images, ...newImageItems],
      },
    }))
  }

  const handleRemoveImage = (e: MouseEvent, indexToRemove: number) => {
    e.stopPropagation()

    if (images[indexToRemove]?.croppedImage) {
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
    if (aspect === "4:5") return s.crop_frame_portrait
    if (aspect === "16:9") return s.crop_frame_landscape
    return s.crop_frame_square
  }

  return (
    <div className={s.container}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg, image/png, image/jpg"
        className={s.hidden_input}
        onChange={handleAddFiles}
      />

      <div
        className={s.viewport}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className={clsx(s.crop_frame, getAspectClass())}>
          <img
            src={currentItem.croppedImage || ""}
            alt="Crop target"
            className={s.source_image}
            style={{
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
              width: aspect === "16:9" ? "100%" : "auto",
              height: aspect === "4:5" ? "100%" : "auto",
              minWidth: aspect === "1:1" ? "100%" : "none",
              minHeight: aspect === "1:1" ? "100%" : "none",
            }}
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
                {(["1:1", "4:5", "16:9"] as AspectType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={clsx(s.aspect_btn, aspect === type && s.aspect_btn_active)}
                    onClick={() => {
                      setAspect(type)
                      setPosition({ x: 0, y: 0 })
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
        </div>

        <div className={s.right_controls}>
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
                      src={img.croppedImage || ""}
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
