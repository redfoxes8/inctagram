import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { subscriptionsQueryKeys } from "../../api/subscriptions-api"
import { CheckoutStatusResponse, FeedbackState } from "../types"
import { GetCheckoutSessionStatusResponseDtoStatus } from "@/shared/api/schema"

export const useCheckoutFeedback = (sessionStatus: CheckoutStatusResponse | undefined) => {
  const queryClient = useQueryClient()

  const [dismissed, setDismissed] = useState(false)

  const feedback = useMemo<FeedbackState>(() => {
    if (!sessionStatus || dismissed) return null

    if (sessionStatus.status === GetCheckoutSessionStatusResponseDtoStatus.COMPLETED) {
      return { kind: "success", text: "Payment was successful!" }
    }

    if (
      sessionStatus.status === GetCheckoutSessionStatusResponseDtoStatus.FAILED ||
      sessionStatus.status === GetCheckoutSessionStatusResponseDtoStatus.EXPIRED
    ) {
      return { kind: "error", text: "Transaction failed, please try again." }
    }

    return null
  }, [sessionStatus, dismissed])

  useEffect(() => {
    if (!sessionStatus) return

    if (sessionStatus.status === GetCheckoutSessionStatusResponseDtoStatus.COMPLETED) {
      queryClient.invalidateQueries({ queryKey: ["me"] })
      queryClient.invalidateQueries({ queryKey: subscriptionsQueryKeys.current() })
    }
  }, [sessionStatus, queryClient])

  const clearFeedback = () => {
    setDismissed(true)

    const url = new URL(window.location.href)
    url.searchParams.delete("session_id")
    window.history.replaceState({}, "", url.toString())
  }

  return { feedback, clearFeedback }
}
