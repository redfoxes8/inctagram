import type { SettingsTab } from "@/shared/config/pages.config"

export type ProfileSettingsFormValues = {
  username: string
  firstName: string
  lastName: string
  dateOfBirth?: Date
  country: string
  city: string
  aboutMe: string
}

export type ProfileSettingsTab = SettingsTab
