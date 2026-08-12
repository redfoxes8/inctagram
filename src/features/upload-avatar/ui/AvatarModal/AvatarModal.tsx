"use client"

import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"

import { useMeQuery } from "@/features/auth/api/use-me"
import { Icon } from "@/shared/ui/Icon"
import { Modal } from "@/shared/ui/Modal"
import { Button } from "@/shared/ui/Button"

import s from "./AvatarModal.module.css"
import { useUploadAvatarMutation } from "../../api/useAvatar"

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"]

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const AvatarModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const { data: currentUser } = useMeQuery()
  const userId = currentUser?.userId ? Number(currentUser.userId) : undefined
  const { mutateAsync: uploadAvatar, isPending } = useUploadAvatarMutation(userId)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setFile(null)
        setPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return null
        })
        setError(null)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) {
      setError("The photo must be less than 10 Mb and have JPEG or PNG format")
      return false
    }
    setError(null)
    return true
  }

  const handleFileSelect = (file: File) => {
    if (!validateFile(file)) return
    setFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
    e.target.value = ""
  }

  const handleSave = async () => {
    if (!file) return
    try {
      await uploadAvatar(file)
      toast.success("Profile photo updated successfully!")
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error((error as any)?.message || "Failed to upload profile photo")
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        className={s.hidden}
        onChange={handleFileInputChange}
      />

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Add a profile photo"
        size="m"
        showCancelButton
        cancelText="Cancel"
        confirmText="Save"
        onConfirm={handleSave}
        onCancel={onClose}
        isConfirmDisabled={!file || isPending}
        isLoading={isPending}
        contentClassName={s.modalContent}
      >
        <div className={s.container}>
          {error && <p className={s.error}>{error}</p>}

          {!preview ? (
            <div className={s.uploadArea} onClick={() => fileInputRef.current?.click()}>
              <div className={s.iconBg}>
                <Icon name="image-outline" className={s.icon} />
              </div>
              <Button type="button" variant="primary" className={s.selectButton}>
                Select from Computer
              </Button>
            </div>
          ) : (
            <div className={s.previewWrapper}>
              <div className={s.previewCircle}>
                <img src={preview} alt="Preview" className={s.image} />
              </div>
              <button
                type="button"
                className={s.removeBtn}
                onClick={() => {
                  URL.revokeObjectURL(preview)
                  setFile(null)
                  setPreview(null)
                }}
                aria-label="Remove photo"
              >
                <Icon name="close" />
              </button>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
