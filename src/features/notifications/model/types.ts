import type { paths } from "@/shared/api/schema"

export type GetNotificationsResponse =
  paths["/api/v1/notifications"]["get"]["responses"]["200"]["content"]["application/json"]

export type NotificationItem = GetNotificationsResponse["items"][number]

export type UnseenCountResponse =
  paths["/api/v1/notifications/unseen-count"]["get"]["responses"]["200"]["content"]["application/json"]

export type MarkSeenResponse =
  paths["/api/v1/notifications/seen"]["patch"]["responses"]["200"]["content"]["application/json"]

export type PaymentNotificationType =
  | "SUBSCRIPTION_ACTIVATED"
  | "SUBSCRIPTION_EXTENDED"
  | "UPCOMING_PAYMENT"
  | "SUBSCRIPTION_EXPIRING"
  | "PAYMENT_FAILED"
  | "PAYMENT_RECOVERED"
  | "SUBSCRIPTION_CANCELLED"

export type NotificationCreatedWebSocketPayload = {
  notification: NotificationItem
  unseenCount: number
}

export type NotificationsUnseenCountWebSocketPayload = {
  unseenCount: number
  seenThrough?: string
}
