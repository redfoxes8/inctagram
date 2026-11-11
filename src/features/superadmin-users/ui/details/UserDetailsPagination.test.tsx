import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SelectBox } from "@/shared/ui/SelectBox"
import type {
  Connection,
  PaymentItem,
  UploadedPhoto,
  UploadedPhotosData,
} from "@/features/superadmin-users/model/user-details.types"
import { UserDetailsTab } from "@/features/superadmin-users/ui/details/UserDetailsTab"
import { UserUploadedPhotos } from "@/features/superadmin-users/ui/details/UserUploadedPhotos"

const photos = vi.hoisted(() => ({
  result: {} as {
    data?: UploadedPhotosData
    loading: boolean
    error?: Error
    refetch: () => Promise<unknown>
  },
}))
vi.mock("@/features/superadmin-users/api/user-photos-api", () => ({
  useSuperadminUserPhotos: () => photos.result,
}))
// Keep real SelectBox rendering; inspect its options before Radix hydrates portals.
vi.mock("@/shared/ui/SelectBox", async (original) => {
  const actual = await original<typeof import("@/shared/ui/SelectBox")>()
  return { ...actual, SelectBox: vi.fn(actual.SelectBox) }
})
const onSizeChange = vi.fn()

const payment: PaymentItem = {
  transactionId: "mock-payment",
  createdAt: "2026-11-11T00:00:00.000Z",
  paidAt: null,
  subscriptionEndsAt: null,
  amountMinor: 1000,
  currency: "USD",
  billingInterval: "MONTH",
  billingIntervalCount: 1,
  provider: "STRIPE",
}
const photo: UploadedPhoto = { imageId: "mock-image", postId: "mock-post", url: null }
function connection<T>(items: T[], page = 1): Connection<T> {
  return {
    items,
    totalCount: items.length ? 16 : 0,
    pageInfo: {
      page,
      pageSize: 8,
      pagesCount: items.length ? 2 : 0,
      hasNextPage: items.length > 0 && page < 2,
    },
  }
}
function renderPayments(items: PaymentItem[], loading = false, errorMessage?: string, page = 1, pageSize = 8) {
  return renderToStaticMarkup(
    <UserDetailsTab
      tab="payments"
      connection={connection(items, page)}
      input={{ page, pageSize }}
      loading={loading}
      errorMessage={errorMessage}
      onRetry={vi.fn()}
      onPageChange={vi.fn()}
      onPageSizeChange={onSizeChange}
    />,
  )
}
function renderPhotos(items: UploadedPhoto[], page = 1, pageSize = 8) {
  photos.result.data = { superadminUser: { userId: "mock-user", uploadedPhotos: connection(items, page) } }
  return renderToStaticMarkup(
    <UserUploadedPhotos
      userId="mock-user"
      input={{ page, pageSize }}
      onPageChange={vi.fn()}
      onPageSizeChange={onSizeChange}
    />,
  )
}
function arrow(html: string, label: string) {
  const tag = html.match(/<button\b[^>]*>/g)?.find((value) => value.includes(`aria-label="${label}"`))
  expect(tag).toBeDefined()
  return tag ?? ""
}
function expectAvailableSizeSelector(html: string) {
  const trigger = html.match(/<button\b[^>]*>/g)?.find((value) => value.includes('role="combobox"'))
  expect(trigger).toBeDefined()
  expect(trigger).not.toContain("disabled")
  const selectProps = vi.mocked(SelectBox).mock.calls.at(-1)?.[0]
  expect(selectProps?.options.map((option) => option.value)).toEqual(["4", "8", "10"])
  selectProps?.onChange?.("10")
  expect(onSizeChange).toHaveBeenCalledExactlyOnceWith(10)
}

beforeEach(() => {
  vi.mocked(SelectBox).mockClear()
  onSizeChange.mockClear()
  photos.result = { loading: false, refetch: vi.fn().mockResolvedValue({}) }
})

describe("detail tab pagination with local responses (no network)", () => {
  it.each([4, 8, 10])("keeps empty Payments pagination and the enabled size selector at size %s", (size) => {
    const html = renderPayments([], false, undefined, 1, size)
    expect(html).toContain("No payments yet.")
    expect(arrow(html, "Previous page")).toContain("disabled")
    expect(arrow(html, "Next page")).toContain("disabled")
    expectAvailableSizeSelector(html)
  })

  it.each([4, 8, 10])("keeps empty Uploaded photos pagination and the enabled size selector at size %s", (size) => {
    const html = renderPhotos([], 1, size)
    expect(html).toContain("No photos yet.")
    expect(arrow(html, "Previous page")).toContain("disabled")
    expect(arrow(html, "Next page")).toContain("disabled")
    expectAvailableSizeSelector(html)
  })

  it("preserves populated Payments and page boundaries", () => {
    const first = renderPayments([payment])
    expect(first).toContain("Stripe")
    expect(first).not.toContain("No payments yet.")
    expect(arrow(first, "Previous page")).toContain("disabled")
    expect(arrow(first, "Next page")).not.toContain("disabled")
    const last = renderPayments([payment], false, undefined, 2)
    expect(arrow(last, "Previous page")).not.toContain("disabled")
    expect(arrow(last, "Next page")).toContain("disabled")
  })

  it("preserves populated Uploaded photos and page boundaries", () => {
    const first = renderPhotos([photo])
    expect(first).toContain("Image unavailable")
    expect(first).not.toContain("No photos yet.")
    expect(arrow(first, "Next page")).not.toContain("disabled")
    const last = renderPhotos([photo], 2)
    expect(arrow(last, "Previous page")).not.toContain("disabled")
    expect(arrow(last, "Next page")).toContain("disabled")
  })

  it("does not show Payments pagination while loading or on error", () => {
    expect(renderPayments([], true)).toContain("Loading payments")
    expect(renderPayments([], true)).not.toContain('aria-label="Pagination"')
    const failed = renderPayments([], false, "Mock payment failure")
    expect(failed).toContain("Mock payment failure")
    expect(failed).not.toContain('aria-label="Pagination"')
    expect(failed).not.toContain("No payments yet.")
  })

  it("does not show photo pagination for loading, error, or a null connection", () => {
    photos.result.loading = true
    const loading = renderPhotos([])
    expect(loading).toContain("Loading photos")
    expect(loading).not.toContain('aria-label="Pagination"')
    photos.result.loading = false
    photos.result.error = new Error("Mock photo failure")
    const failed = renderPhotos([])
    expect(failed).toContain('role="alert"')
    expect(failed).not.toContain('aria-label="Pagination"')
    photos.result.error = undefined
    photos.result.data = { superadminUser: { userId: "mock-user", uploadedPhotos: null } }
    const unavailable = renderToStaticMarkup(
      <UserUploadedPhotos
        userId="mock-user"
        input={{ page: 1, pageSize: 8 }}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    )
    expect(unavailable).toContain('role="alert"')
    expect(unavailable).not.toContain("No photos yet.")
    expect(unavailable).not.toContain('aria-label="Pagination"')
  })
})
