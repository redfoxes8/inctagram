"use client"

import { ReactNode, useEffect } from "react"

import s from "./Modal.module.css"
import clsx from "clsx"
import { Button } from "../Button"
import { Icon } from "../Icon"

type ModalProps = {
<<<<<<< HEAD
  email?: string
=======
  title?: string
  children: ReactNode
  isOpen: boolean
>>>>>>> main
  onClose: () => void

  onConfirm?: () => void
  onCancel?: () => void

  confirmText?: string
  cancelText?: string
  className?: string
  showCancelButton?: boolean
  email?: string
}

export const Modal = ({
  title = "Modal",
  className,
  children,
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancelButton = false,
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <dialog open className={s.dialog}>
      <div className={s.overlay} onClick={onClose} />

      <div className={clsx(s.modal, className)}>
        <div className={s.header}>
          <span className={clsx(s.title, "h1")}>{title}</span>

          <Icon name="close-outline" onClick={onClose} className={s.closeIcon} />
        </div>

        <div className={s.content}>
          {children}

          <div className={s.buttons}>
            {showCancelButton && (
              <Button variant="outlined" onClick={onCancel || onClose}>
                {cancelText}
              </Button>
            )}

            <Button onClick={onConfirm || onClose}>{confirmText}</Button>
          </div>
        </div>
      </div>
    </dialog>
  )
}
