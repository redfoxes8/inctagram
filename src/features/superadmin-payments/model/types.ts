// docs/GRAPHQL_SUPERADMIN_FRONTEND_API.md, P2; runtime.graphql 1.7.0.
export const PAYMENTS_PAGE_SIZE = 6
export type PaymentsSortKey = "USERNAME" | "CREATED_AT" | "AMOUNT" | "PAYMENT_METHOD"
export type PaymentsSort = `${PaymentsSortKey}_${"ASC" | "DESC"}`
export type PaymentsInput = { page: number; searchUsername: string; sort: PaymentsSort }
export type PaymentListItem = {
  transactionId: string
  userId: string
  username: string | null
  avatarUrl: string | null
  createdAt: string
  amountMinor: number
  currency: string
  productName: string
  billingInterval: "WEEK" | "MONTH"
  billingIntervalCount: number
  provider: "STRIPE" | "PAYPAL"
  status: "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED"
}
export type PaymentsPage = {
  items: PaymentListItem[]
  totalCount: number
  pageInfo: { page: number; pageSize: number; pagesCount: number; hasNextPage: boolean }
}

export function nextPaymentsSort(current: PaymentsSort, key: PaymentsSortKey): PaymentsSort {
  return current === `${key}_ASC` ? `${key}_DESC` : `${key}_ASC`
}

export function formatPaymentDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unavailable"
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })
    .format(date)
    .replaceAll("/", ".")
}

export function formatListAmount(amountMinor: number, currency: string): string {
  try {
    const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency })
    return formatter.format(amountMinor / 10 ** (formatter.resolvedOptions().maximumFractionDigits ?? 2))
  } catch {
    return `${amountMinor} minor units (${currency})`
  }
}

export function formatListSubscription(payment: PaymentListItem): string {
  const unit = payment.billingInterval === "WEEK" ? "week" : "month"
  return `${payment.productName} · ${payment.billingIntervalCount} ${unit}${payment.billingIntervalCount === 1 ? "" : "s"}`
}

export function getAvatarHref(value: string | null): string | undefined {
  if (!value) return undefined
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value
  try {
    const url = new URL(value)
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : undefined
  } catch {
    return undefined
  }
}
