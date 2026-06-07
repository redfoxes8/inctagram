"use client"

import { useForm } from "react-hook-form"
import { useUpdatePostMutation } from "../api/use-edit-post"
import { EditPostData } from "./edit-post.types"
import { useEffect, useState } from "react"

type FormValues = {
  description: string
}

type UseEditPostFormProps = {
  isOpen: boolean
  data: EditPostData
  onClose: () => void
  confirmText?: string
  onConfirm?: () => void
}

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
      })
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return windowSize
}

export const useEditPostForm = ({ isOpen, data, onClose, onConfirm }: UseEditPostFormProps) => {
  const { width } = useWindowSize()
  const modalSize: "s" | "m" | "l" = width >= 1024 ? "l" : width >= 768 ? "m" : "s"

  const imageUrl = data.post.images[0]?.url
  const initialDescription = data.post.description
  const userName = data.user.username
  const avatarUrl = data.user.avatarUrl
  const id = data.post.id
  const maxLength = 500

  const [showConfirm, setShowConfirm] = useState(false)
  const { mutateAsync, isPending } = useUpdatePostMutation()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty, errors },
  } = useForm<FormValues>({
    defaultValues: { description: initialDescription },
    mode: "onChange",
  })

  const description = watch("description") ?? ""

  useEffect(() => {
    if (!isOpen) return
    reset({
      description: initialDescription,
    })
  }, [isOpen, initialDescription, reset])

  const handleRequestClose = () => {
    if (isDirty) {
      setShowConfirm(true)
      return
    }
    onClose()
  }

  const handleDiscardChanges = () => {
    setShowConfirm(false)
    onClose()
  }

  const onSubmit = async (data: FormValues) => {
    if (isPending) return

    try {
      await mutateAsync({
        postId: id,
        payload: {
          description: data.description,
        },
      })
      onClose()
      onConfirm?.()
    } catch (error) {
      console.error("Failed to update post:", error)
    }
  }

  return {
    imageUrl,
    userName,
    avatarUrl,
    description,
    maxLength,
    isDirty,
    isPending,
    showConfirm,
    modalSize,
    isDescriptionValid: !errors.description,
    descriptionError: errors.description?.message,
    handleSubmit: handleSubmit(onSubmit),
    handleRequestClose,
    handleDiscardChanges,
    setShowConfirm,
    register: register("description", {
      maxLength: {
        value: maxLength,
        message: `Maximum ${maxLength} characters allowed`,
      },
    }),
  }
}
