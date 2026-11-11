import { formatUserDate } from "@/features/superadmin-users/model/types"
import type { PaymentItem } from "@/features/superadmin-users/model/user-details.types"

export const formatOptionalDate = (value: string | null) => (value ? formatUserDate(value) : "Unavailable")

export function formatPaymentAmount(amountMinor: number, currency: string): string {
  try {
    const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency })
    const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2
    return formatter.format(amountMinor / 10 ** fractionDigits)
  } catch {
    return `${amountMinor} minor units (${currency})`
  }
}

export function formatSubscription(payment: PaymentItem): string {
  const unit = payment.billingInterval === "WEEK" ? "week" : "month"
  return `${payment.billingIntervalCount} ${unit}${payment.billingIntervalCount === 1 ? "" : "s"}`
}
