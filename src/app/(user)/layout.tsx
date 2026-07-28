"use client"

import { useLogoutHandler } from "@/features/auth/lib/use-logout-handler"
import { CreatePostWizard } from "@/features/create-post/ui/post-wizard/CreatePostWizard"
import { useCreatePostStore } from "@/features/create-post/model/store"
import { Modal, Sidebar } from "@/shared/ui"

import styles from "./layout.module.css"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { showConfirm, setShowConfirm, handleLogout, isPending } = useLogoutHandler()
  const openCreateModal = useCreatePostStore((state) => state.openModal)

  return (
    <>
      <div className={styles.userShell}>
        <Sidebar onLogout={() => setShowConfirm(true)} onCreateClick={openCreateModal} />
        <main className={styles.userMain}>
          <div className={styles.contentContainer}>{children}</div>
        </main>
      </div>

      <CreatePostWizard />

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
