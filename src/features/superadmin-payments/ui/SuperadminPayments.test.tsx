import { Children, isValidElement, type ComponentProps, type ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Input } from "@/shared/ui/Input"
import { Pagination } from "@/shared/ui/Pagination"
import { SuperadminPayments } from "@/features/superadmin-payments/ui/SuperadminPayments"
import { PaymentsTable } from "@/features/superadmin-payments/ui/PaymentsTable"
import type { PaymentsInput, PaymentsPage } from "@/features/superadmin-payments/model/types"

const hooks = vi.hoisted(() => ({
  states: [] as unknown[],
  index: 0,
  input: undefined as PaymentsInput | undefined,
  loading: false,
  error: undefined as unknown,
  page: undefined as PaymentsPage | null | undefined,
  refetch: vi.fn(),
}))
vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useState: (initial: unknown) => {
    const index = hooks.index++
    if (!(index in hooks.states)) hooks.states[index] = initial
    return [
      hooks.states[index],
      (value: unknown) => {
        hooks.states[index] = typeof value === "function" ? value(hooks.states[index]) : value
      },
    ]
  },
}))
vi.mock("@/features/superadmin-payments/api/payments-api", async (original) => ({
  ...(await original<typeof import("@/features/superadmin-payments/api/payments-api")>()),
  useSuperadminPayments: (input: PaymentsInput) => {
    hooks.input = input
    return {
      data: hooks.page === undefined ? undefined : { superadminPayments: hooks.page },
      loading: hooks.loading,
      error: hooks.error,
      refetch: hooks.refetch,
    }
  },
}))
function render() {
  hooks.index = 0
  return SuperadminPayments()
}
function props<T>(tree: ReactNode, type: unknown): T {
  let found: T | undefined
  Children.forEach(tree, (item) => {
    if (!isValidElement<{ children?: ReactNode }>(item)) return
    if (item.type === type) found = item.props as T
    else {
      try {
        found = props<T>(item.props.children, type)
      } catch {
        /* Search remaining siblings. */
      }
    }
  })
  if (!found) throw new Error("Component missing")
  return found
}
const table = () => props<ComponentProps<typeof PaymentsTable>>(render(), PaymentsTable)
const pagination = () => props<ComponentProps<typeof Pagination>>(render(), Pagination)
function setSearch(value: string) {
  props<ComponentProps<typeof Input>>(render(), Input).onChange?.({ target: { value } } as Parameters<
    NonNullable<ComponentProps<typeof Input>["onChange"]>
  >[0])
}
function submitSearch() {
  props<{ onSubmit: (event: { preventDefault: () => void }) => void }>(render(), "form").onSubmit({
    preventDefault: vi.fn(),
  })
}
async function settle() {
  for (let i = 0; i < 6; i++) await Promise.resolve()
}
beforeEach(() => {
  hooks.states = []
  hooks.loading = false
  hooks.error = undefined
  hooks.page = { items: [], totalCount: 0, pageInfo: { page: 1, pageSize: 6, pagesCount: 0, hasNextPage: false } }
  hooks.refetch.mockReset()
})

describe("payments list state (mocked query hook, no requests)", () => {
  it("keeps pagination visible for an empty success, with a fixed size of six", () => {
    const control = pagination()
    expect(control.showWhenEmpty).toBe(true)
    expect(control.fixedPageSize).toBe(true)
    expect(control.pageSize).toBe(6)
    expect(control.pagesCount).toBe(0)
    expect(table().errorMessage).toBeUndefined()
    expect(hooks.input).not.toHaveProperty("pageSize")
  })
  it("trims search and resets to page one without dropping the server sort", () => {
    table().onSort("AMOUNT")
    pagination().onPageChange(3)
    setSearch("  example  ")
    submitSearch()
    render()
    expect(hooks.input).toEqual({ page: 1, searchUsername: "example", sort: "AMOUNT_ASC" })
    pagination().onPageChange(2)
    render()
    expect(hooks.input).toEqual({ page: 2, searchUsername: "example", sort: "AMOUNT_ASC" })
    setSearch("   ")
    submitSearch()
    render()
    expect(hooks.input?.searchUsername).toBe("")
  })
  it.each(["USERNAME", "CREATED_AT", "AMOUNT", "PAYMENT_METHOD"] as const)(
    "sorts %s on the server and resets the page",
    (key) => {
      setSearch("mock")
      submitSearch()
      pagination().onPageChange(2)
      table().onSort(key)
      render()
      expect(hooks.input).toEqual({ page: 1, searchUsername: "mock", sort: `${key}_ASC` })
      table().onSort(key)
      render()
      expect(hooks.input?.sort).toBe(`${key}_DESC`)
    },
  )
  it("does not expose stale rows or pagination during loading and error", () => {
    hooks.loading = true
    expect(table().loading).toBe(true)
    expect(table().page).toBeUndefined()
    expect(pagination).toThrow("Component missing")
    hooks.loading = false
    hooks.error = new Error("Mock outage")
    expect(table().page).toBeUndefined()
    expect(table().errorMessage).toContain("Unable to load payments")
    expect(pagination).toThrow("Component missing")
  })
  it("does not turn a null response into a successful empty list", () => {
    hooks.page = null
    expect(table().errorMessage).toContain("Unable to load payments")
    expect(pagination).toThrow("Component missing")
  })
  it("keeps retry explicit and corrects a vanished last page using backend metadata", async () => {
    pagination().onPageChange(4)
    hooks.refetch.mockResolvedValue({
      data: {
        superadminPayments: { ...hooks.page, pageInfo: { page: 4, pageSize: 6, pagesCount: 2, hasNextPage: false } },
      },
    })
    table().onRetry()
    await settle()
    render()
    expect(hooks.refetch).toHaveBeenCalledTimes(1)
    expect(hooks.input?.page).toBe(2)
  })
})
