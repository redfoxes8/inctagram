"use client"

import { useState } from "react"
import { useCreatePostStore } from "../../../model/store"
import { Icon } from "@/shared/ui/Icon"
import s from "./PublicationStep.module.css"
import clsx from "clsx"

export const PublicationStep = () => {
  const { data, setCurrentImageIndex, setDescription, setLocation } = useCreatePostStore()
  const { images, currentImageIndex, description, location } = data

  const [isLocationFocused, setIsLocationFocused] = useState(false)

  const locationSuggestions = ["New York, Washington Square Park", "New York, Central Park"]

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const currentImage = images[currentImageIndex]?.croppedImage || ""
  const currentCropArea = images[currentImageIndex]?.cropArea

  const getContainerStyle = () => {
    const baseStyle = {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }

    if (!currentCropArea) return baseStyle

    const { aspect } = currentCropArea

    switch (aspect) {
      case "1:1":
        return { ...baseStyle, aspectRatio: "1 / 1" }
      case "4:5":
        return { ...baseStyle, aspectRatio: "4 / 5" }
      case "16:9":
        return { ...baseStyle, aspectRatio: "16 / 9" }
      case "Original":
      default:
        return { ...baseStyle, width: "auto", height: "auto", maxWidth: "100%", maxHeight: "100%" }
    }
  }

  return (
    <div className={s.container}>
      <div className={s.media_side}>
        <div className={s.image_container} style={getContainerStyle()}>
          <img src={currentImage} alt={`Slide ${currentImageIndex + 1}`} className={s.main_image} />
        </div>

        {currentImageIndex > 0 && (
          <button type="button" className={clsx(s.arrow_btn, s.arrow_left)} onClick={handlePrevImage}>
            <Icon name="arrow-ios-back-outline" />
          </button>
        )}

        {currentImageIndex < images.length - 1 && (
          <button type="button" className={clsx(s.arrow_btn, s.arrow_right)} onClick={handleNextImage}>
            <Icon name="arrow-ios-forward" />
          </button>
        )}

        {images.length > 1 && (
          <div className={s.dots_container}>
            {images.map((_, index) => (
              <span
                key={index}
                className={clsx(s.dot, index === currentImageIndex && s.dot_active)}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      <div className={s.info_side}>
        <div className={s.profile_header}>
          <div className={s.avatar_placeholder}>{/* <img src={user.avatar} alt="avatar" /> */}</div>
          <span className={s.username}>URLProfile</span>
        </div>

        <div className={s.field_group}>
          <label className={s.label}>Add publication descriptions</label>
          <div className={s.textarea_wrapper}>
            <textarea
              className={s.textarea}
              placeholder="Text-area"
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <span className={s.char_counter}>{description.length}/500</span>
          </div>
        </div>

        <div className={s.field_group}>
          <label className={s.label}>Add location</label>
          <div className={s.input_wrapper}>
            <input
              type="text"
              className={s.input}
              placeholder="New York"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setIsLocationFocused(true)}
              onBlur={() => setTimeout(() => setIsLocationFocused(false), 200)}
            />
            <Icon name="pin-outline" className={s.pin_icon} />

            {isLocationFocused && (
              <ul className={s.suggestions_list}>
                {locationSuggestions.map((suggestion, idx) => (
                  <li key={idx} className={s.suggestion_item} onMouseDown={() => setLocation(suggestion)}>
                    <span className={s.suggestion_main}>New York</span>
                    <span className={s.suggestion_sub}>Washington Square Park</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
