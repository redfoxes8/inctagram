"use client"

import { useEffect, useRef } from "react"
import { Icon } from "../Icon"
import { Button } from "@/shared/ui/Button"
import s from "./AddPhotoModal.module.css"

type AddPhotoModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelectFromComputer?: () => void
  onOpenDraft?: () => void
}

export const AddPhotoModal = ({ isOpen, onClose, onSelectFromComputer, onOpenDraft }: AddPhotoModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Управление нативным поведением тега dialog (включая закрытие на Esc)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <dialog ref={dialogRef} onClose={onClose} className={s.dialog}>
      {/* Шапка модального окна */}
      <div className={s.header}>
        <span className={s.title}>Add Photo</span>
        <button type="button" className={s.closeButton} onClick={onClose} aria-label="Close modal">
          <Icon name="close-outline" />
        </button>
      </div>

      {/* Контентная область */}
      <div className={s.content}>
        {/* Зона загрузки / Иконка */}
        <div className={s.imagePlaceholder}>
          <Icon name="image-outline" className={s.imageIcon} />
        </div>

        {/* Группа кнопок управления */}
        <div className={s.actionsGroup}>
          <Button onClick={onSelectFromComputer} className={s.primaryBtn}>
            Select from Computer
          </Button>

          <Button variant="outlined" onClick={onOpenDraft} className={s.draftBtn}>
            Open Draft
          </Button>
        </div>
      </div>
    </dialog>
  )
}
