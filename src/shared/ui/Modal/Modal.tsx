"use client"

import { ReactNode, useEffect } from "react"
import s from "./Modal.module.css"
import clsx from "clsx"
import { Button } from "../Button"
import { Icon } from "../Icon"

export const SIZE_MAP = {
  s: "378px",
  m: "486px",
  l: "972px",
}

type ModalProps = {
  title?: string
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  onCancel?: () => void
  contentClassName?: string
  showHeader?: boolean
  showFooter?: boolean
  header?: ReactNode
  footer?: ReactNode
  confirmText?: string
  cancelText?: string
  className?: string
  showCancelButton?: boolean
  buttonsClassName?: string
  dialogClassName?: string
  email?: string
  size?: "s" | "m" | "l"
  fullscreenOnMobile?: boolean
}

export const Modal = ({
  title = "Modal",
  className,
  children,
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  dialogClassName,
  contentClassName,
  showHeader = true,
  showFooter = true,
  header,
  footer,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancelButton = false,
  buttonsClassName,
  size = "s",
  fullscreenOnMobile = false,
}: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <dialog
      open
      className={clsx(s.dialog, dialogClassName)}
      data-size={size}
      data-fullscreen-mobile={fullscreenOnMobile}
      style={{ maxWidth: SIZE_MAP[size] }}
    >
      <div className={s.overlay} onClick={onClose} />

      <div className={clsx(s.modal, className)}>
        {header
          ? header
          : showHeader && (
              <div className={s.header}>
                <span className={clsx(s.title, "h1")}>{title}</span>
                <Icon name="close-outline" onClick={onClose} className={s.closeIcon} />
              </div>
            )}

        <div className={clsx(s.content, contentClassName)}>{children}</div>

        {footer
          ? footer
          : showFooter && (
              <div className={clsx(s.buttons, buttonsClassName)}>
                {showCancelButton && (
                  <Button variant="outlined" onClick={onCancel || onClose}>
                    {cancelText}
                  </Button>
                )}
                <Button onClick={onConfirm || onClose}>{confirmText}</Button>
              </div>
            )}
      </div>
    </dialog>
  )
}
