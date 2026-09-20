"use client"

import { useEffect, useCallback, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PAGES } from "@/shared/config/pages.config"

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFallback, setShowFallback] = useState(false)

  const redirectToSubscriptions = useCallback(() => {
    const sessionId = searchParams.get("session_id")
    const url = new URL(PAGES.SETTINGS("subscriptions"), window.location.origin)
    if (sessionId) url.searchParams.set("session_id", sessionId)
    router.replace(url.pathname + url.search)
  }, [router, searchParams])

  useEffect(() => {
    redirectToSubscriptions()

    const timeout = setTimeout(() => setShowFallback(true), 1500)
    return () => clearTimeout(timeout)
  }, [redirectToSubscriptions])

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <p>Processing payment…</p>
      {showFallback && (
        <button onClick={redirectToSubscriptions} style={{ marginTop: 16 }}>
          Continue
        </button>
      )}
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
