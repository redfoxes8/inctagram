"use client"

import { useForm } from "react-hook-form"
import { useUpdatePostMutation } from "../api/use-edit-post"
import { EditPostData } from "./edit-post.types"
import { useEffect, useState } from "react"
import { toast } from "sonner"

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

export const useEditPostForm = ({ isOpen, data, onClose, onConfirm }: UseEditPostFormProps) => {
  const [showConfirm, setShowConfirm] = useState(false)
  const { mutateAsync, isPending } = useUpdatePostMutation()

  const imageUrl = data.post.images[0]?.url
  const initialDescription = data.post.description
  const userName = data.user.username
  const avatarUrl = data.user.avatarUrl
  const postId = data.post.id
  const maxLength = 500

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
        postId: postId,
        payload: {
          description: data.description,
        },
      })
      toast.success("Post updated successfully!")
      onClose()
      onConfirm?.()
    } catch (error) {
      console.error("Failed to update post:", error)
      toast.error("Failed to update post. Please try again.")
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
    isDescriptionValid: !errors.description,
    descriptionError: errors.description?.message,
    register: register("description", {
      maxLength: {
        value: maxLength,
        message: `Maximum ${maxLength} characters allowed`,
      },
    }),
    handleSubmit: handleSubmit(onSubmit),
    handleRequestClose,
    handleDiscardChanges,
    setShowConfirm,
  }
}
