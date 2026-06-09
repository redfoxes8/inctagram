"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { PAGES } from "@/shared/config/pages.config"
import { useLogoutMutation } from "@/features/auth/api/use-logout.mutation"

export function useLogoutHandler() {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const { mutate: logout, isPending } = useLogoutMutation()

  const handleLogout = useCallback(() => {
    logout(undefined, {
      onSuccess: () => {
        setShowConfirm(false)
        router.replace(PAGES.LOGIN)
      },
      onError: (error) => {
        console.error("Failed to logout:", error)
        setShowConfirm(false)
      },
    })
  }, [logout, router])

  return { showConfirm, setShowConfirm, handleLogout, isPending }
}
