"use client"

import { useState, useCallback } from "react"
import { useLogoutMutation } from "@/features/auth/api/use-logout.mutation"

export function useLogoutHandler() {
  const [showConfirm, setShowConfirm] = useState(false)
  const { mutate: logout, isPending } = useLogoutMutation()

  const handleLogout = useCallback(() => {
    logout()
    setShowConfirm(false)
  }, [logout])

  return { showConfirm, setShowConfirm, handleLogout, isPending }
}
