"use client"

import { useMeQuery } from "@/features/auth/api/use-me"
import { useCreatePostStore } from "@/features/create-post/model/store"
import { useLogoutHandler } from "@/features/auth/lib/use-logout-handler"

import { Modal, Sidebar } from "@/shared/ui"

export function SidebarWidget() {
  const { data: user } = useMeQuery()
  const { showConfirm, setShowConfirm, handleLogout, isPending } = useLogoutHandler()
  const openCreateModal = useCreatePostStore((state) => state.openModal)

  if (!user) {
    return null
  }

  return (
    <>
      <Sidebar onLogout={() => setShowConfirm(true)} onCreateClick={openCreateModal} />

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
