"use client"

import { ProfileSettings } from "@/features/profile-settings"
import { Suspense } from "react"

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileSettings />
    </Suspense>
  )
}
