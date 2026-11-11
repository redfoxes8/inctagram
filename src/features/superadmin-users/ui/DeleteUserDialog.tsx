"use client"

import { Button } from "@/shared/ui/Button"
import { Modal } from "@/shared/ui/Modal"
import type { SuperadminUser } from "@/features/superadmin-users/model/types"
import s from "./SuperadminUsers.module.css"

type Props = {
  user: SuperadminUser | null
  pending: boolean
  error: string
  onClose: () => void
  onConfirm: () => void
}

export function DeleteUserDialog({ user, pending, error, onClose, onConfirm }: Props) {
  return (
    <Modal
      isOpen={!!user}
      title="Delete user"
      onClose={onClose}
      isCloseDisabled={pending}
      footer={
        <div className={s.deleteFooter}>
          <Button type="button" variant="outlined" onClick={onClose} disabled={pending}>
            No
          </Button>
          <Button type="button" onClick={onConfirm} disabled={pending} aria-busy={pending}>
            {pending ? "Deleting…" : "Yes"}
          </Button>
        </div>
      }
    >
      <p>Are you sure you want to delete {user?.username ?? user?.userId}?</p>
      {error && (
        <p className={s.deleteError} role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}
