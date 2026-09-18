import { useMemo } from "react"
import { GetSubscriptionsResponse } from "../types"

export const useSubscriptionsView = (subData: GetSubscriptionsResponse | undefined) => {
  const currentSubscription = subData?.current ?? null
  const queuedSubscriptions = subData?.queued ?? []

  const allSubscriptions = useMemo(() => {
    const list = []
    if (currentSubscription) list.push(currentSubscription)
    const sortedQueued = [...queuedSubscriptions].sort((a, b) => a.sequence - b.sequence)
    list.push(...sortedQueued)
    return list
  }, [currentSubscription, queuedSubscriptions])

  const lastSubscription = useMemo(() => {
    if (queuedSubscriptions.length > 0) {
      const sorted = [...queuedSubscriptions].sort((a, b) => a.sequence - b.sequence)
      return sorted[sorted.length - 1]
    }
    return currentSubscription
  }, [queuedSubscriptions, currentSubscription])

  return { currentSubscription, queuedSubscriptions, allSubscriptions, lastSubscription }
}
