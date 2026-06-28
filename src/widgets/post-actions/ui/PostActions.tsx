"use client"

import { useState } from "react"
import { DeletePostModal } from "@/features/posts/delete-post/ui/DeletePostModal"
import { EditPostModal } from "@/features/posts/edit-post/ui/EditPostModal"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { EditPostData } from "@/features/posts/edit-post/model/edit-post.types"
import { Icon } from "@/shared/ui/Icon"
import clsx from "clsx"
import s from "./PostActions.module.css"

type PostActionsProps = {
  postId: string
  isOwner: boolean
  editData: EditPostData
  onEditSuccess?: () => void
  onDeleteSuccess?: () => void
  triggerClassName?: string
  align?: "start" | "center" | "end"
}

export const PostActions = ({
  postId,
  isOwner = true,
  editData,
  onEditSuccess,
  onDeleteSuccess,
  triggerClassName,
  align = "end",
}: PostActionsProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Если не владелец - не показываем ничего
  if (!isOwner) return null
  console.log("PostActions render:", { isOwner, isMenuOpen, postId })
  const handleEdit = () => {
    setIsMenuOpen(false)
    setIsEditOpen(true)
  }

  const handleDelete = () => {
    setIsMenuOpen(false)
    setIsDeleteOpen(true)
  }

  const handleEditClose = () => {
    setIsEditOpen(false)
  }

  const handleEditSuccess = () => {
    setIsEditOpen(false)
    onEditSuccess?.()
  }

  const handleDeleteClose = () => {
    setIsDeleteOpen(false)
  }

  const handleDeleteSuccess = () => {
    setIsDeleteOpen(false)
    onDeleteSuccess?.()
  }

  return (
    <>
      <DropdownMenu.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenu.Trigger asChild>
          <button className={clsx(s.trigger, triggerClassName)} aria-label="Меню поста" type="button">
            <Icon name="more-horizontal-outline" className={s.triggerIcon} />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className={s.content} sideOffset={5} align={align} side="bottom">
            <DropdownMenu.Item className={s.item} onClick={handleEdit}>
              <Icon name="edit-2-outline" className={s.itemIcon} />
              Edit Post
            </DropdownMenu.Item>

            <DropdownMenu.Separator className={s.separator} />

            <DropdownMenu.Item className={clsx(s.item, s.itemDanger)} onClick={handleDelete}>
              <Icon name="trash-outline" className={s.itemIcon} />
              Delete Post
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <EditPostModal isOpen={isEditOpen} onClose={handleEditClose} data={editData} onConfirm={handleEditSuccess} />

      <DeletePostModal
        postId={postId}
        isOpen={isDeleteOpen}
        onClose={handleDeleteClose}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}
