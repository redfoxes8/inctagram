"use client"

import { useDeletePostMutation } from "@/features/posts/delete-post/api/use-delete-post-mutation"
import { Modal } from "@/shared/ui"

type Props = {
  postId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const DeletePostModal = ({ postId, isOpen, onClose, onSuccess }: Props) => {
  const { mutate: deletePost, isPending } = useDeletePostMutation()

  const handleConfirm = () => {
    console.log("Deleting post")
    onSuccess?.()
    deletePost({ postId }, { onSuccess: onClose })
  }

  return (
    <Modal
      title="Delete Post"
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onClose}
      onConfirm={handleConfirm}
      showFooter
      showCancelButton
      confirmText={isPending ? "Deleting..." : "Yes"}
      cancelText="No"
    >
      <p>Are you sure you want to delete this post?</p>
    </Modal>
  )
}
