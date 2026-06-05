"use client"

import { useState, useRef, DragEvent, ChangeEvent } from "react"
import clsx from "clsx"
import { Icon } from "@/shared/ui/Icon"
import { Button } from "@/shared/ui/Button"
import s from "./SelectStep.module.css"
import { useCreatePostStore } from "@/features/create-post/model/store"

const MAX_FILE_SIZE = 20 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"]

export const SelectStep = () => {
  const setFiles = useCreatePostStore((state) => state.setFiles)
  const { data, setStep } = useCreatePostStore()

  const hasDraft = data.images.length > 0

  const [isDragActive, setIsDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateAndProcessFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return

    const validFiles: File[] = []
    setError(null)

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]

      if (!file) continue

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Error: format Not supported! Only JPEG or PNG")
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("Error: File size exceeds 20MB")
        return
      }

      validFiles.push(file)
    }

    if (validFiles.length > 0) {
      const processedFiles = validFiles.map((file) => {
        const blobUrl = URL.createObjectURL(file)
        return blobUrl
      })

      setFiles(validFiles)
    }
  }

  const handleDrag = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (e.dataTransfer.files) {
      validateAndProcessFiles(e.dataTransfer.files)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndProcessFiles(e.target.files)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={s.container}>
      <div
        className={clsx(s.dropzone, isDragActive && s.dropzone_active)}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className={s.hidden_input}
          accept={ALLOWED_TYPES.join(", ")}
          multiple
          onChange={handleInputChange}
        />

        <div className={s.image_placeholder}>
          {error ? <p className={s.error_text}>{error}</p> : <Icon name="image-outline" className={s.image_icon} />}
        </div>

        <Button onClick={handleButtonClick} type="button" className={s.select_btn}>
          <span className="h3">Select from Computer</span>
        </Button>

        {hasDraft && (
          <Button onClick={() => setStep("CROP")} type="button" variant="outlined" className={s.draft_btn}>
            Open Draft
          </Button>
        )}
      </div>
    </div>
  )
}
