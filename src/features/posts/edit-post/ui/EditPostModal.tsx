"use client"

import { Modal } from "@/shared/ui/Modal"
import { TextArea } from "@/shared/ui/TextArea"
import { EditPostData } from "../model/edit-post.types"
import { CloseEditConfirmModal } from "./CloseEditConfirmModal"
import s from "./EditPostModal.module.css"
import { Button } from "@/shared/ui"
import clsx from "clsx"
import Image from "next/image"
import { Icon } from "@/shared/ui/Icon"
import { useEditPostForm } from "../model/useEditPostForm"

type Props = {
  isOpen: boolean
  onClose: () => void
  data: EditPostData
  confirmText?: string
  onConfirm?: () => void
}

export const EditPostModal = ({ isOpen, onClose, data, confirmText = "Save Changes", onConfirm }: Props) => {
  const {
    imageUrl,
    userName,
    avatarUrl,
    description,
    maxLength,
    isDirty,
    isPending,
    showConfirm,
    isDescriptionValid,
    descriptionError,
    register,
    handleSubmit,
    handleRequestClose,
    handleDiscardChanges,
    setShowConfirm,
  } = useEditPostForm({
    isOpen,
    data,
    onClose,
    onConfirm,
  })

  const isSubmitDisabled = !isDirty || isPending || !isDescriptionValid

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleRequestClose}
        showHeader={false}
        showFooter={false}
        className={s.modal}
        title="Edit Post"
        size="l"
        contentClassName={s.noPaddingContent}
        dialogClassName={s.dialogClassName}
        fullscreenOnMobile={true}
      >
        <div className={s.desktopHeader}>
          <span className={"h1"}>Edit Post</span>
          <Icon name="close-outline" onClick={handleRequestClose} className={s.closeButton} />
        </div>

        <div className={s.mobileHeader}>
          <Button type="button" onClick={handleRequestClose} variant="outlined" className={clsx(s.cancelButton, "h3")}>
            Cancel
          </Button>
          <span className={"h2"}>Edit Post</span>
          <Button
            type="button"
            disabled={isSubmitDisabled}
            variant="ghost"
            onClick={handleSubmit}
            className={clsx(s.mobileSaveButton, "h3")}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>

        <div className={s.wrapper}>
          <div className={s.imageBlock}>
            {imageUrl && (
              <Image src={imageUrl} alt="post" className={s.image} fill sizes="(max-width: 768px) 100vw, 50vw" />
            )}
          </div>

          <div className={s.rightSide}>
            <div className={s.user}>
              {avatarUrl ? (
                <Image src={avatarUrl} alt={userName} className={s.avatar} width={36} height={36} />
              ) : (
                <div className={s.avatarPlaceholder}>
                  <Icon name="person-outline" />
                </div>
              )}
              <span className={clsx(s.userName, "h3")}>{userName}</span>
            </div>

            <div className={s.description_block}>
              <TextArea
                {...register}
                maxLength={maxLength}
                label="Add publication descriptions"
                placeholder="Add publication descriptions"
                className={clsx(s.textarea)}
                error={descriptionError}
              />
              <div className={clsx(s.counter, "small_text")}>
                {description?.length || 0}/{maxLength}
              </div>
              {descriptionError && <div className={clsx(s.errorMessage, "small_text")}>{descriptionError}</div>}
            </div>

            <div className={s.customFooter}>
              <Button
                type="button"
                disabled={isSubmitDisabled}
                onClick={handleSubmit}
                className={clsx(s.desktopSaveButton, "h3")}
              >
                {isPending ? "Saving..." : confirmText}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <CloseEditConfirmModal
        isOpen={showConfirm}
        onConfirm={handleDiscardChanges}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}
