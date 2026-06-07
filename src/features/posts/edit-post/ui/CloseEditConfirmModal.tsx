"use client"

import { Modal } from "@/shared/ui/Modal"

type Props = {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const CloseEditConfirmModal = ({ isOpen, onConfirm, onCancel }: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Discard changes?"
      showFooter
      showCancelButton
      confirmText="Yes"
      cancelText="No"
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <p>Do you really want to finish editing?</p>

      <p>If you close the changes you have made will not be saved</p>
    </Modal>
  )
}
