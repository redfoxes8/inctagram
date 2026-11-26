import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { Pagination } from "@/shared/ui/Pagination"
import { PaymentsTable } from "@/features/superadmin-payments/ui/PaymentsTable"
import type { PaymentListItem, PaymentsPage } from "@/features/superadmin-payments/model/types"

const payment: PaymentListItem = {
  transactionId: "mock-transaction",
  userId: "mock-user",
  username: "Zulu",
  avatarUrl: null,
  createdAt: "2026-11-12T00:00:00.000Z",
  amountMinor: 1250,
  currency: "USD",
  productName: "Mock plan",
  billingInterval: "MONTH",
  billingIntervalCount: 1,
  provider: "STRIPE",
  status: "SUCCEEDED",
}
function page(items: PaymentListItem[], current = 1): PaymentsPage {
  return {
    items,
    totalCount: items.length ? 12 : 0,
    pageInfo: {
      page: current,
      pageSize: 6,
      pagesCount: items.length ? 2 : 0,
      hasNextPage: !!items.length && current < 2,
    },
  }
}
function render(result: PaymentsPage | undefined, loading = false, errorMessage?: string) {
  return renderToStaticMarkup(
    <PaymentsTable
      page={result}
      loading={loading}
      errorMessage={errorMessage}
      sort="USERNAME_ASC"
      onSort={vi.fn()}
      onRetry={vi.fn()}
      onPreviousPage={vi.fn()}
    />,
  )
}
function controls(result: PaymentsPage) {
  return renderToStaticMarkup(
    <Pagination
      currentPage={result.pageInfo.page}
      pagesCount={result.pageInfo.pagesCount}
      pageSize={6}
      showWhenEmpty
      fixedPageSize
      onPageChange={vi.fn()}
      onPageSizeChange={vi.fn()}
    />,
  )
}
function arrow(html: string, label: string) {
  const tag = html.match(/<button\b[^>]*>/g)?.find((item) => item.includes(`aria-label="${label}"`))
  expect(tag).toBeDefined()
  return tag ?? ""
}

describe("general payments rendering with synthetic data only", () => {
  it("keeps a successful empty list distinct and pagination visible with disabled arrows and static six", () => {
    const empty = page([])
    expect(render(empty)).toContain("No payments found.")
    expect(render(empty)).not.toContain('role="alert"')
    const html = controls(empty)
    expect(html).toContain('aria-label="Pagination"')
    expect(arrow(html, "Previous page")).toContain("disabled")
    expect(arrow(html, "Next page")).toContain("disabled")
    expect(html).toContain("<span>6</span>")
    expect(html).not.toContain('role="combobox"')
  })
  it("uses server row order, actual money and subscription fields instead of client sorting", () => {
    const html = render(
      page([payment, { ...payment, transactionId: "mock-second", username: "Alpha", provider: "PAYPAL" }]),
    )
    expect(html.indexOf("Zulu")).toBeLessThan(html.indexOf("Alpha"))
    expect(html).toContain("12.11.2026")
    expect(html).toContain("$12.50")
    expect(html).toContain("Mock plan · 1 month")
    expect(html).toContain("Stripe")
    expect(html).toContain("PayPal")
  })
  it("preserves nullable identity fields without losing a payment", () => {
    const html = render(page([{ ...payment, username: null, avatarUrl: null }]))
    expect(html).toContain("Unavailable")
    expect(html).toContain("Avatar unavailable")
    expect(html).toContain("$12.50")
    expect(html).not.toContain("No payments found.")
  })
  it("hides stale records while loading or on error instead of displaying empty success", () => {
    const loading = render(page([payment]), true)
    expect(loading).toContain("Loading payments")
    expect(loading).not.toContain("Zulu")
    const failed = render(page([payment]), false, "Mock upstream error")
    expect(failed).toContain('role="alert"')
    expect(failed).toContain("Retry")
    expect(failed).not.toContain("Zulu")
    expect(failed).not.toContain("No payments found.")
  })
  it("preserves populated pagination boundaries", () => {
    const first = controls(page([payment]))
    expect(arrow(first, "Previous page")).toContain("disabled")
    expect(arrow(first, "Next page")).not.toContain("disabled")
    const last = controls(page([payment], 2))
    expect(arrow(last, "Previous page")).not.toContain("disabled")
    expect(arrow(last, "Next page")).toContain("disabled")
  })
})
