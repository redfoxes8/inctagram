"use client"

import { Modal, Sidebar } from "@/shared/ui"
import { useMeQuery } from "@/features/auth/api/use-me"
import { useCreatePostStore } from "@/features/create-post/model/store"
import { useAuthRedirect } from "@/features/auth/lib/use-auth-redirect"
import { useLogoutHandler } from "@/features/auth/lib/use-logout-handler"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useMeQuery()
  const { mounted } = useAuthRedirect(user, isLoading)
  const { showConfirm, setShowConfirm, handleLogout, isPending } = useLogoutHandler()
  const openCreateModal = useCreatePostStore((state) => state.openModal)

  // 1. Показываем лоадер вместо пустого экрана, пока идет первичная проверка
  if (isLoading || !mounted) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Loading app...</p>
      </div>
    )
  }

  // 2. Рендерим интерфейс приложения
  return (
    <div style={{ display: "flex" }}>
      {/* Сидбар показываем ТОЛЬКО если юзер авторизован */}
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
