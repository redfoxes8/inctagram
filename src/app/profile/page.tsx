"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLogoutMutation } from "@/features/auth/api/use-logout.mutation"
import { Button } from "@/shared/ui/Button"
import { Sidebar } from "@/shared/ui/Sidebar"

export default function Profile() {
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const { mutate: logout, isPending } = useLogoutMutation()

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push("/login")
      },
      onError: (error) => {
        console.error("Failed to logout:", error)
        setShowConfirm(false)
      },
    })
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar style={{ top: "60px" }} onLogout={() => setShowConfirm(true)} />

      <main style={{ paddingTop: "80px", paddingLeft: "300px" }}>
        <h1 style={{ color: "red" }}>Profile</h1>
        {showConfirm && (
          <div>
            <p style={{ fontSize: "14px", marginBottom: "18px" }}>
              Are you really want to log out of your account "chelbik email:chelbik@google.com"?
            </p>

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
      </main>
    </div>
  )
}
