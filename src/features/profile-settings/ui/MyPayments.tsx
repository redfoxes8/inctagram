"use client"

import { useState } from "react"

import { usePaymentsHistoryQuery } from "@/features/profile-settings/api/payments-history-api"
import type { SchemaPaymentHistoryItemResponseDto } from "@/shared/api/schema"
import { Pagination } from "@/shared/ui"

import s from "./ProfileSettings.module.css"

const formatDate = (value: string | null) => {
  if (!value) {
    return "-"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

const formatPrice = (amountMinor: number, currency: string) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  })
  const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2
  const amount = amountMinor / 10 ** fractionDigits

  return formatter.format(amount)
}

const formatBillingInterval = (count?: number | null, interval?: string | null) => {
  if (!count || !interval) return "-"
  const normalizedInterval = interval.toLowerCase()
  const labels: Record<string, [string, string]> = {
    day: ["day", "days"],
    week: ["week", "weeks"],
    month: ["month", "months"],
    year: ["year", "years"],
  }
  const [singular, plural] = labels[normalizedInterval] ?? [normalizedInterval, `${normalizedInterval}s`]

  return `${count} ${count === 1 ? singular : plural}`
}

const formatLabel = (value: string) => {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

const PaymentRow = ({ item }: { item: SchemaPaymentHistoryItemResponseDto }) => (
  <tr>
    <td>{formatDate(item.paidAt ?? item.createdAt)}</td>
    <td>{formatDate(item.subscriptionEndsAt)}</td>
    <td>{formatPrice(item.amountMinor, item.currency)}</td>
    <td>{formatBillingInterval(item.billingIntervalCount, item.billingInterval)}</td>
    <td>{formatLabel(item.provider)}</td>
  </tr>
)

export const MyPayments = () => {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState("10")
  const perPage = Number(pageSize)
  const { data, isError, isLoading } = usePaymentsHistoryQuery({ pageNumber, pageSize: perPage })
  const items = data?.items ?? []
  const currentPage = data?.page ?? pageNumber
  const pagesCount = data?.pagesCount ?? 0
  const hasPayments = items.length > 0
  const shouldShowPagination = pagesCount > 0

  const handlePageSizeChange = (value: number) => {
    setPageSize(String(value))
    setPageNumber(1)
  }

  return (
    <div className={s.payments}>
      <div className={s.paymentsTableScroll}>
        <table className={s.paymentsTable}>
          <thead>
            <tr>
              <th>Date of Payment</th>
              <th>End date of subscription</th>
              <th>Price</th>
              <th>Subscription Type</th>
              <th>Payment Type</th>
            </tr>
          </thead>

          <tbody>
            {isLoading &&
              Array.from({ length: 5 }, (_, index) => (
                <tr key={index}>
                  <td colSpan={5}>
                    <span className={s.paymentsSkeleton} />
                  </td>
                </tr>
              ))}

            {!isLoading && hasPayments && items.map((item) => <PaymentRow key={item.transactionId} item={item} />)}

            {!isLoading && !hasPayments && (
              <tr>
                <td colSpan={5} className={s.paymentsStateCell}>
                  {isError ? "Unable to load payment history" : "No payments yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {shouldShowPagination && (
        <Pagination
          currentPage={currentPage}
          pagesCount={pagesCount}
          pageSize={perPage}
          disabled={isLoading}
          onPageChange={setPageNumber}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  )
}
