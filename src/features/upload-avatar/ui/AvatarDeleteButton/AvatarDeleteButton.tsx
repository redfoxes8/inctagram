"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useMeQuery } from "@/features/auth/api/use-me"
import { Modal } from "@/shared/ui/Modal"
import { Icon } from "@/shared/ui/Icon"
import { useDeleteAvatarMutation } from "../../api/useAvatar"

import s from "./AvatarDeleteButton.module.css"
import { useRouter } from "next/navigation"

interface Props {
  onDeleted?: () => void
}

export const AvatarDeleteButton = ({ onDeleted }: Props) => {
  const router = useRouter()
  const { data: currentUser } = useMeQuery()
  const userId = currentUser?.userId || undefined
  const { mutateAsync: deleteAvatar, isPending } = useDeleteAvatarMutation(userId)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteAvatar()
      toast.success("Profile photo deleted successfully")

      router.refresh()

      setIsConfirmOpen(false)
      onDeleted?.()
    } catch {
      toast.error("Failed to delete profile photo")
    }
  }

  return (
    <>
      <button
        type="button"
        className={s.deleteBtn}
        onClick={() => setIsConfirmOpen(true)}
        disabled={isPending}
        aria-label="Delete profile photo"
      >
        <Icon name="close" className={s.deleteIcon} />
      </button>

      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Delete Profile Photo"
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
        showCancelButton
        size="s"
        isLoading={isPending}
        buttonsClassName={s.deleteButtonsContainer}
      >
        <p>Do you really want to delete your profile photo?</p>
      </Modal>
    </>
  )
}
