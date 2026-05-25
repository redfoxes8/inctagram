"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLogoutMutation } from "@/features/auth/api/use-logout.mutation"
import { Sidebar } from "@/shared/ui/Sidebar"
import { Button } from "@/shared/ui/Button"
import { AddPhotoModal } from "@/shared/ui/AddPhotoModal"

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const { mutate: logout, isPending } = useLogoutMutation()

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => router.push("/login"),
      onError: (error) => {
        console.error("Failed to logout:", error)
        setShowConfirm(false)
      },
    })
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar onLogout={() => setShowConfirm(true)} onCreateClick={() => setIsCreateOpen(true)} />

      <div style={{ flex: 1 }}>{children}</div>

      {isCreateOpen && (
        <AddPhotoModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSelectFromComputer={() => console.log("Select file...")}
          onOpenDraft={() => console.log("Open drafts...")}
        />
      )}

      {showConfirm && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "20px",
            border: "1px solid",
          }}
        >
          <p>Are you really want to log out?</p>
          <div style={{ display: "flex", gap: "24px" }}>
            <Button variant="outlined" onClick={() => setShowConfirm(false)} disabled={isPending}>
              No
            </Button>
            <Button onClick={handleLogout} disabled={isPending}>
              {isPending ? "Logging out..." : "Yes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
