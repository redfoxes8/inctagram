"use client"

import { useRef, useState } from "react"
import { SuperadminPosts } from "@/features/superadmin-posts/ui/SuperadminPosts"
import type { SuperadminPost } from "@/features/superadmin-posts/model/types"
import { BanUserDialog } from "@/features/superadmin-users/ui/BanUserDialog"
import { useBanSuperadminUser } from "@/features/superadmin-users/api/ban-user-api"
import { getUsersErrorMessage } from "@/features/superadmin-users/api/users-api"
import type { BanReasonInput } from "@/features/superadmin-users/model/ban-user.types"

// Compose sibling features here to preserve FSD import direction.
export function SuperadminPostsWidget() {
  const [target, setTarget] = useState<SuperadminPost | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const inFlight = useRef(false)
  const banUser = useBanSuperadminUser()
  const confirmBan = async (reason: BanReasonInput) => {
    if (!target || inFlight.current) return
    inFlight.current = true
    setPending(true)
    setError("")
    try {
      const result = await banUser(target.userId, reason)
      if (result.outcome === "NOT_FOUND" || result.outcome === "USER_DELETED") {
        setError(result.outcome === "NOT_FOUND" ? "User not found." : "This user has been deleted.")
      } else setTarget(null)
      // A block does not remove a post from the superadmin feed (runtime contract).
    } catch (failure) {
      setError(`Unable to ban user. ${getUsersErrorMessage(failure)}`)
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }
  return (
    <>
      <SuperadminPosts
        banPending={pending}
        onBan={(post) => {
          if (inFlight.current) return
          setError("")
          setTarget(post)
        }}
      />
      {target && (
        <BanUserDialog
          key={target.userId}
          user={target}
          pending={pending}
          error={error}
          onConfirm={(reason) => void confirmBan(reason)}
          onClose={() => {
            if (inFlight.current) return
            setTarget(null)
            setError("")
          }}
        />
      )}
    </>
  )
}
