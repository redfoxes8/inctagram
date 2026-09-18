import type { SettingsTab } from "@/shared/config/pages.config"
import { paths } from "@/shared/api/schema"

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

export type PaymentsProductsResponse =
  paths["/api/v1/payments/products"]["get"]["responses"]["200"]["content"]["application/json"]

export type CheckoutSessionBody =
  paths["/api/v1/payments/checkout"]["post"]["requestBody"]["content"]["application/json"]

export type CheckoutSessionResponse =
  paths["/api/v1/payments/checkout"]["post"]["responses"]["201"]["content"]["application/json"]

export type PaymentProviderType =
  paths["/api/v1/payments/checkout"]["post"]["requestBody"]["content"]["application/json"]["provider"]

export type GetSubscriptionsResponse =
  paths["/api/v1/payments/subscriptions"]["get"]["responses"]["200"]["content"]["application/json"]

export type ToggleAutoRenewResponse =
  paths["/api/v1/payments/subscriptions/{subscriptionId}/auto-renew"]["patch"]["responses"]["200"]["content"]["application/json"]

export type CheckoutStatusResponse =
  paths["/api/v1/payments/checkout/{checkoutSessionId}/status"]["get"]["responses"]["200"]["content"]["application/json"]

export type CreateCheckoutArgs = {
  productId: string
  provider: PaymentProviderType
  autoRenewConsent: boolean
}

export type QueuedSubscription = GetSubscriptionsResponse["queued"][number]
