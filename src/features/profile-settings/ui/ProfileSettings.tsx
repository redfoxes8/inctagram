"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { GeneralInformationForm } from "@/features/profile-settings/ui/GeneralInformationForm"
import type { ProfileSettingsTab } from "@/features/profile-settings/types/type"
import { PAGES } from "@/shared/config/pages.config"
import { Tabs } from "@/shared/ui"

import s from "./ProfileSettings.module.css"

const SETTINGS_TABS: Array<{ label: string; value: ProfileSettingsTab }> = [
  { label: "General information", value: "info" },
  { label: "Devices", value: "devices" },
  { label: "Account Management", value: "subscriptions" },
  { label: "My payments", value: "payments" },
]

const isSettingsTab = (value: string | null): value is ProfileSettingsTab => {
  return SETTINGS_TABS.some((tab) => tab.value === value)
}

export const ProfileSettings = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const part = searchParams.get("part")
  const activeTab: ProfileSettingsTab = isSettingsTab(part) ? part : "info"

  const handleTabChange = (value: string) => {
    if (isSettingsTab(value)) {
      router.push(PAGES.SETTINGS(value))
    }
  }

  return (
    <section className={s.page}>
      <div className={s.content}>
        <Tabs items={SETTINGS_TABS} value={activeTab} onValueChange={handleTabChange} className={s.tabs} />

        <div className={s.divider} />

        {activeTab === "info" && <GeneralInformationForm />}
      </div>
    </section>
  )
}
