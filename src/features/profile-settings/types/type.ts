import type { SettingsTab } from "@/shared/config/pages.config"
import type { paths } from "@/shared/api/schema"

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

export type GetSubscriptionsResponse =
  paths["/api/v1/payments/subscriptions"]["get"]["responses"][200]["content"]["application/json"]

export type ToggleAutoRenewBody =
  paths["/api/v1/payments/subscriptions/{subscriptionId}/auto-renew"]["patch"]["requestBody"]["content"]["application/json"]

export type ToggleAutoRenewResponse =
  paths["/api/v1/payments/subscriptions/{subscriptionId}/auto-renew"]["patch"]["responses"][200]["content"]["application/json"]
