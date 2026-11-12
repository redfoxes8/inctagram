"use client"

import { useState } from "react"
import { Button } from "@/shared/ui/Button"
import { Modal } from "@/shared/ui/Modal"
import { SelectBox } from "@/shared/ui/SelectBox"
import { TextArea } from "@/shared/ui/TextArea"
import type { SuperadminUser } from "@/features/superadmin-users/model/types"
import { getBanReason, type BanReasonInput } from "@/features/superadmin-users/model/ban-user.types"
import s from "./SuperadminUsers.module.css"

type Props = {
  user: SuperadminUser
  pending: boolean
  error: string
  onClose: () => void
  onConfirm: (reason: BanReasonInput) => void
}

const reasons = [
  { value: "BAD_BEHAVIOR", label: "Bad behavior" },
  { value: "ADVERTISING_PLACEMENT", label: "Advertising placement" },
  { value: "ANOTHER_REASON", label: "Another reason" },
]

export function BanUserDialog({ user, pending, error, onClose, onConfirm }: Props) {
  const [code, setCode] = useState("")
  const [text, setText] = useState("")
  const [validationError, setValidationError] = useState("")
  const confirm = () => {
    if (pending) return
    let reason: BanReasonInput
    try {
      reason = getBanReason(code, text)
    } catch (failure) {
      setValidationError(failure instanceof Error ? failure.message : "Check the reason.")
      return
    }
    setValidationError("")
    onConfirm(reason)
  }

  return (
    <Modal
      isOpen
      title="Ban user"
      onClose={onClose}
      isCloseDisabled={pending}
      contentClassName={s.banContent}
      dialogClassName={s.banDialog}
      footer={
        <div className={s.banFooter}>
          <Button type="button" onClick={onClose} disabled={pending}>
            No
          </Button>
          <Button type="button" variant="outlined" onClick={confirm} disabled={pending} aria-busy={pending}>
            {pending ? "Banning…" : "Yes"}
          </Button>
        </div>
      }
    >
      <p>
        Are you sure you want to ban <strong>{user.username ?? user.userId}</strong>?
      </p>
      <SelectBox
        options={reasons}
        value={code}
        placeholder="Reason for ban"
        width="100%"
        height="36px"
        triggerClassName={s.banReasonTrigger}
        contentClassName={s.banReasonMenu}
        disabled={pending}
        onChange={(value) => {
          if (pending) return
          setCode(value)
          setText("")
          setValidationError("")
        }}
      />
      {code === "ANOTHER_REASON" && (
        <TextArea
          id="ban-user-reason"
          label="Reason"
          rows={3}
          value={text}
          disabled={pending}
          error={validationError || undefined}
          onChange={(event) => {
            setText(event.target.value)
            setValidationError("")
          }}
        />
      )}
      {code !== "ANOTHER_REASON" && validationError && (
        <p className={s.deleteError} role="alert">
          {validationError}
        </p>
      )}
      {error && (
        <p className={s.deleteError} role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}
