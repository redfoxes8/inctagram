"use client"

import { Button } from "@/shared/ui/Button"
import { Pagination } from "@/shared/ui/Pagination"
import type {
  Connection,
  DetailsTab,
  FollowItem,
  PageInput,
  PaymentItem,
} from "@/features/superadmin-users/model/user-details.types"
import {
  formatOptionalDate,
  formatPaymentAmount,
  formatSubscription,
} from "@/features/superadmin-users/model/user-details.formatters"
import s from "./UserDetails.module.css"

type Props = {
  tab: DetailsTab
  connection: Connection<PaymentItem | FollowItem> | undefined
  input: PageInput
  loading: boolean
  errorMessage: string | undefined
  onRetry: () => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function UserDetailsTab({
  tab,
  connection,
  input,
  loading,
  errorMessage,
  onRetry,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const isPayments = tab === "payments"
  const columns = isPayments
    ? ["Date of Payment", "End date of subscription", "Amount", "Subscription Type", "Payment Type"]
    : ["User ID", "Profile link", "Username", "Subscription Date"]
  return (
    <>
      <div className={s.tableScroll} aria-busy={loading}>
        <table className={s.table}>
          <caption className={s.srOnly}>
            {tab}, {input.pageSize} records per page
          </caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th scope="col" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className={s.tableState} role="status">
                  Loading {tab}…
                </td>
              </tr>
            )}
            {!loading && errorMessage && (
              <tr>
                <td colSpan={columns.length} className={s.tableState}>
                  <p role="alert">{errorMessage}</p>
                  <Button variant="outlined" onClick={onRetry}>
                    Retry
                  </Button>
                </td>
              </tr>
            )}
            {!loading && !errorMessage && connection && connection.items.length === 0 && (
              <tr>
                <td colSpan={columns.length} className={s.tableState}>
                  {!isPayments
                    ? "No data to display."
                    : connection.totalCount > 0
                      ? "This page is empty."
                      : "No payments yet."}
                  {input.page > 1 && (
                    <Button
                      variant="outlined"
                      onClick={() =>
                        onPageChange(Math.max(1, Math.min(input.page - 1, connection.pageInfo.pagesCount)))
                      }
                    >
                      Previous page
                    </Button>
                  )}
                </td>
              </tr>
            )}
            {!loading &&
              !errorMessage &&
              connection?.items.map((item) =>
                "transactionId" in item ? (
                  <tr key={item.transactionId}>
                    <td title={item.paidAt ? undefined : "Payment date unavailable; showing creation date"}>
                      {formatOptionalDate(item.paidAt ?? item.createdAt)}
                    </td>
                    <td>{formatOptionalDate(item.subscriptionEndsAt)}</td>
                    <td>{formatPaymentAmount(item.amountMinor, item.currency)}</td>
                    <td>{formatSubscription(item)}</td>
                    <td>{item.provider === "STRIPE" ? "Stripe" : "PayPal"}</td>
                  </tr>
                ) : (
                  <tr key={item.userId}>
                    <td>{item.userId}</td>
                    <td className={s.muted}>Unavailable</td>
                    <td className={s.muted}>Unavailable</td>
                    <td className={s.muted}>Unavailable</td>
                  </tr>
                ),
              )}
          </tbody>
        </table>
      </div>
      {!loading && !errorMessage && connection && (
        <>
          <Pagination
            currentPage={connection.pageInfo.page}
            pagesCount={Math.min(10000, connection.pageInfo.pagesCount)}
            pageSize={input.pageSize}
            pageSizeOptions={[4, 8, 10]}
            disabled={loading}
            showWhenEmpty
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </>
      )}
    </>
  )
}
