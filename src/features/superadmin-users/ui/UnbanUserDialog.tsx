"use client"

import { Button } from "@/shared/ui/Button"
import { Modal } from "@/shared/ui/Modal"
import type { SuperadminUser } from "@/features/superadmin-users/model/types"
import s from "./SuperadminUsers.module.css"

type Props = {
  user: SuperadminUser
  pending: boolean
  error: string
  onClose: () => void
  onConfirm: () => void
}

export function UnbanUserDialog({ user, pending, error, onClose, onConfirm }: Props) {
  return (
    <Modal
      isOpen
      title="Un-ban user"
      onClose={onClose}
      isCloseDisabled={pending}
      contentClassName={s.banContent}
      dialogClassName={s.banDialog}
      footer={
        <div className={s.banFooter}>
          <Button type="button" onClick={onClose} disabled={pending}>
            No
          </Button>
          <Button type="button" variant="outlined" onClick={onConfirm} disabled={pending} aria-busy={pending}>
            {pending ? "Un-banning…" : "Yes"}
          </Button>
        </div>
      }
    >
      <p>
        Are you sure want to un-ban <strong>{user.username ?? user.userId}</strong>?
      </p>
      {error && (
        <p className={s.deleteError} role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}
