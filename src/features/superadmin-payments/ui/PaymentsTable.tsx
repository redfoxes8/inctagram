"use client"

import * as Avatar from "@radix-ui/react-avatar"
import { Button } from "@/shared/ui/Button"
import { Icon } from "@/shared/ui/Icon"
import {
  formatListAmount,
  formatListSubscription,
  formatPaymentDate,
  getAvatarHref,
  type PaymentsPage,
  type PaymentsSort,
  type PaymentsSortKey,
} from "@/features/superadmin-payments/model/types"
import s from "./SuperadminPayments.module.css"

type Props = {
  page: PaymentsPage | undefined
  sort: PaymentsSort
  loading: boolean
  errorMessage?: string
  onSort: (key: PaymentsSortKey) => void
  onRetry: () => void
  onPreviousPage: () => void
}
const columns: { label: string; key?: PaymentsSortKey }[] = [
  { label: "Username", key: "USERNAME" },
  { label: "Date added", key: "CREATED_AT" },
  { label: "Amount", key: "AMOUNT" },
  { label: "Subscription" },
  { label: "Payment Method", key: "PAYMENT_METHOD" },
]

export function PaymentsTable({ page, sort, loading, errorMessage, onSort, onRetry, onPreviousPage }: Props) {
  return (
    <div className={s.tableScroll} aria-busy={loading}>
      <table className={s.table}>
        <caption className={s.srOnly}>Payments list, 6 payments per page</caption>
        <thead>
          <tr>
            {columns.map(({ label, key }) => (
              <th
                scope="col"
                key={label}
                aria-sort={
                  key
                    ? sort.startsWith(`${key}_`)
                      ? sort.endsWith("_ASC")
                        ? "ascending"
                        : "descending"
                      : "none"
                    : undefined
                }
              >
                {key ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className={s.sort}
                    disabled={loading}
                    onClick={() => onSort(key)}
                  >
                    {label} <span aria-hidden="true">{sort === `${key}_ASC` ? "▴" : "▾"}</span>
                  </Button>
                ) : (
                  label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className={s.state} role="status">
                Loading payments…
              </td>
            </tr>
          ) : errorMessage || !page ? (
            <tr>
              <td colSpan={5} className={s.state}>
                <p role="alert">{errorMessage ?? "Unable to load payments. Please try again."}</p>
                <Button variant="outlined" onClick={onRetry}>
                  Retry
                </Button>
              </td>
            </tr>
          ) : page.items.length === 0 ? (
            <tr>
              <td colSpan={5} className={s.state}>
                <p>{page.totalCount === 0 ? "No payments found." : "This page is empty."}</p>
                {page.pageInfo.page > 1 && (
                  <Button variant="outlined" onClick={onPreviousPage}>
                    Previous page
                  </Button>
                )}
              </td>
            </tr>
          ) : (
            page.items.map((payment) => (
              <tr key={payment.transactionId}>
                <td>
                  <div className={s.identity}>
                    <Avatar.Root className={s.avatar}>
                      <Avatar.Image
                        className={s.avatarImage}
                        src={getAvatarHref(payment.avatarUrl)}
                        alt={`${payment.username ?? "User"} avatar`}
                      />
                      <Avatar.Fallback className={s.avatarFallback} aria-label="Avatar unavailable">
                        <Icon name="person-outline" />
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <span className={s.username} title={payment.username ?? undefined}>
                      {payment.username ?? "Unavailable"}
                    </span>
                  </div>
                </td>
                <td>
                  <time dateTime={payment.createdAt}>{formatPaymentDate(payment.createdAt)}</time>
                </td>
                <td>{formatListAmount(payment.amountMinor, payment.currency)}</td>
                <td title={formatListSubscription(payment)}>{formatListSubscription(payment)}</td>
                <td>{payment.provider === "STRIPE" ? "Stripe" : "PayPal"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
