import type { SuperadminUser, UsersPage } from "@/features/superadmin-users/model/types"

// Source: GRAPHQL_SUPERADMIN_FRONTEND_API.md, SA-GQL-03/06/08.
export type UserDetails = SuperadminUser & { avatarUrl: string | null }
export type DetailsTab = "payments" | "followers" | "following"
export type PageInput = { page: number; pageSize: number }
export type Connection<T> = { items: T[]; totalCount: number; pageInfo: UsersPage["pageInfo"] }
export type PaymentItem = {
  transactionId: string
  createdAt: string
  paidAt: string | null
  subscriptionEndsAt: string | null
  amountMinor: number
  currency: string
  billingInterval: "WEEK" | "MONTH"
  billingIntervalCount: number
  provider: "STRIPE" | "PAYPAL"
}
export type FollowItem = { userId: string }
export type UploadedPhoto = { imageId: string; postId: string; url: string | null }
export type UploadedPhotosData = {
  superadminUser: { userId: string; uploadedPhotos: Connection<UploadedPhoto> | null } | null
}
export type TabData = {
  superadminUser: { userId: string; connection: Connection<PaymentItem | FollowItem> | null } | null
}
