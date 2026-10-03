import { ProfileSettings } from "@/features/profile-settings"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileSettings />
    </Suspense>
  )
}
