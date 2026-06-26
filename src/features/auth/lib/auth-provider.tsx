"use client"

import { Modal, Sidebar } from "@/shared/ui"
import { useMeQuery } from "@/features/auth/api/use-me"
import { useCreatePostStore } from "@/features/create-post/model/store"
import { useAuthRedirect } from "@/features/auth/lib/use-auth-redirect"
import { useLogoutHandler } from "@/features/auth/lib/use-logout-handler"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user = true, isLoading } = useMeQuery()
  const { mounted } = useAuthRedirect(user, isLoading)
  const { showConfirm, setShowConfirm, handleLogout, isPending } = useLogoutHandler()
  const openCreateModal = useCreatePostStore((state) => state.openModal)

  if (isLoading || !mounted) return null

  return (
    <div style={{ display: "flex" }}>
      {user && <Sidebar onLogout={() => setShowConfirm(true)} onCreateClick={openCreateModal} />}
      <main style={{ flex: 1 }}>{children}</main>

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
    </div>
  )
}
