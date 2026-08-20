"use client"

import { useEffect, useState } from "react"
import { useMeQuery } from "@/features/auth/api/use-me"
import { useCreatePostStore } from "@/features/create-post/model/store"
import { useLogoutHandler } from "@/features/auth/lib/use-logout-handler"
import { Modal, Sidebar } from "@/shared/ui"
import s from "./SidebarWidget.module.css"

export function SidebarWidget() {
  const { data: user, isLoading } = useMeQuery()
  const [showSkeleton, setShowSkeleton] = useState(false)
  const { showConfirm, setShowConfirm, handleLogout, isPending } = useLogoutHandler()
  const openCreateModal = useCreatePostStore((state) => state.openModal)

  useEffect(() => {
    if (!isLoading) return

    const timer = setTimeout(() => setShowSkeleton(true), 300)
    return () => {
      clearTimeout(timer)
      setShowSkeleton(false)
    }
  }, [isLoading])

  if (showSkeleton) {
    return (
      <aside className={s.skeleton}>
        <div className={s.skeletonAvatar} />
        <div className={s.skeletonRow} />
        <div className={s.skeletonRow} />
        <div className={s.skeletonRow} />
      </aside>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Sidebar
        currentUserId={user.userId || ""}
        onLogout={() => setShowConfirm(true)}
        onCreateClick={openCreateModal}
      />

      <Modal
        title="Log Out"
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleLogout}
        confirmText={isPending ? "Logging out..." : "Yes"}
        onCancel={() => setShowConfirm(false)}
        cancelText="No"
        showCancelButton
      >
        <p>Are you really want to log out?</p>
      </Modal>
    </>
  )
}
