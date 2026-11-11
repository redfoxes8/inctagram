import { Children, isValidElement, type ComponentProps, type ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Pagination } from "@/shared/ui/Pagination"
import type { SuperadminUser, UsersInput, UsersPage } from "@/features/superadmin-users/model/types"
import { SuperadminUsers } from "@/features/superadmin-users/ui/SuperadminUsers"
import { UsersToolbar } from "@/features/superadmin-users/ui/UsersToolbar"
import { UsersTable } from "@/features/superadmin-users/ui/UsersTable"
import { DeleteUserDialog } from "@/features/superadmin-users/ui/DeleteUserDialog"

// Exercise parent handlers with a deterministic hook harness; no DOM or network.
const harness = vi.hoisted(() => ({
  states: [] as unknown[],
  refs: [] as { current: unknown }[],
  stateIndex: 0,
  refIndex: 0,
  input: undefined as unknown,
  deleteUser: vi.fn(),
  refetch: vi.fn(),
}))

vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useState: (initial: unknown) => {
    const index = harness.stateIndex++
    if (!(index in harness.states)) harness.states[index] = initial
    return [
      harness.states[index],
      (value: unknown) => {
        harness.states[index] = typeof value === "function" ? value(harness.states[index]) : value
      },
    ]
  },
  useRef: (initial: unknown) => {
    const index = harness.refIndex++
    return harness.refs[index] ?? (harness.refs[index] = { current: initial })
  },
}))
vi.mock("@/features/superadmin-users/api/delete-user-api", () => ({
  useDeleteSuperadminUser: () => harness.deleteUser,
}))
vi.mock("@/features/superadmin-users/api/users-api", async (original) => ({
  ...(await original<typeof import("@/features/superadmin-users/api/users-api")>()),
  useSuperadminUsers: (input: UsersInput) => {
    harness.input = input
    return { data: { superadminUsers: page(input) }, loading: false, refetch: harness.refetch }
  },
}))

const user: SuperadminUser = {
  userId: "00000000-0000-4000-8000-00000000d003",
  username: "uc3_mock_only",
  profileUrl: null,
  state: "ACTIVE",
  createdAt: "2026-11-11T00:00:00.000Z",
}
function page(input: UsersInput, totalCount = 17): UsersPage {
  const pagesCount = Math.ceil(totalCount / input.pageSize)
  return {
    items: input.page <= pagesCount ? [user] : [],
    totalCount,
    pageInfo: { page: input.page, pageSize: input.pageSize, pagesCount, hasNextPage: input.page < pagesCount },
  }
}
function render() {
  harness.stateIndex = harness.refIndex = 0
  return SuperadminUsers()
}
function props<T>(tree: ReactNode, type: unknown): T {
  let found: T | undefined
  Children.forEach(tree, (child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return
    if (child.type === type) found = child.props as T
    else if (child.props.children) {
      try {
        found = props<T>(child.props.children, type)
      } catch {
        /* Search siblings. */
      }
    }
  })
  if (!found) throw new Error("Component missing from tree")
  return found
}
const dialog = () => props<ComponentProps<typeof DeleteUserDialog>>(render(), DeleteUserDialog)
const table = () => props<ComponentProps<typeof UsersTable>>(render(), UsersTable)
const toolbar = () => props<ComponentProps<typeof UsersToolbar>>(render(), UsersToolbar)
const pagination = () => props<ComponentProps<typeof Pagination>>(render(), Pagination)
async function settle() {
  for (let count = 0; count < 8; count++) await Promise.resolve()
}

beforeEach(() => {
  harness.states = []
  harness.refs = []
  harness.deleteUser.mockReset()
  harness.refetch
    .mockReset()
    .mockImplementation(async () => ({ data: { superadminUsers: page(harness.input as UsersInput) } }))
})

describe("UC-3 confirmation and list state", () => {
  it.each(["No", "close"])("%s closes without a query or mutation", (action) => {
    table().onDelete(user)
    const modal = DeleteUserDialog(dialog())
    expect(modal.props.isOpen).toBe(true)
    expect(JSON.stringify(modal.props.children)).toContain("Are you sure you want to delete ")
    if (action === "close") modal.props.onClose()
    else {
      const footer = modal.props.footer
      if (!isValidElement<{ children: ReactNode }>(footer)) throw new Error("Footer missing")
      const no = Children.toArray(footer.props.children)[0]
      if (!isValidElement<{ onClick: () => void }>(no)) throw new Error("No button missing")
      no.props.onClick()
    }
    expect(dialog().user).toBeNull()
    expect(harness.deleteUser).not.toHaveBeenCalled()
    expect(harness.refetch).not.toHaveBeenCalled()
    expect(table().page?.items).toEqual([user])
  })

  it("sends once on rapid confirmation, disables controls, closes and refreshes on success", async () => {
    let complete!: (value: { userId: string; outcome: string }) => void
    harness.deleteUser.mockReturnValue(
      new Promise((resolve) => {
        complete = resolve
      }),
    )
    table().onDelete(user)
    const confirm = dialog().onConfirm
    confirm()
    confirm()
    expect(harness.deleteUser).toHaveBeenCalledExactlyOnceWith(user.userId)
    expect(dialog().pending).toBe(true)
    expect(DeleteUserDialog(dialog()).props.isCloseDisabled).toBe(true)
    const pendingFooter = DeleteUserDialog(dialog()).props.footer
    if (!isValidElement<{ children: ReactNode }>(pendingFooter)) throw new Error("Footer missing")
    Children.forEach(pendingFooter.props.children, (button) => {
      if (!isValidElement<{ disabled: boolean }>(button)) throw new Error("Button missing")
      expect(button.props.disabled).toBe(true)
    })
    dialog().onClose()
    expect(dialog().user).toEqual(user)
    expect(pagination().disabled).toBe(true)
    complete({ userId: user.userId, outcome: "DELETED" })
    await settle()
    expect(dialog().user).toBeNull()
    expect(dialog().pending).toBe(false)
    expect(harness.refetch).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(render())).not.toMatch(/User deleted|User was already deleted/)
    expect(JSON.stringify(DeleteUserDialog(dialog()).props.children)).not.toContain("Deleting user")
  })

  it("keeps the dialog and row after a failed deletion without refreshing or faking success", async () => {
    harness.deleteUser.mockRejectedValue(new Error("Mock network failure"))
    table().onDelete(user)
    dialog().onConfirm()
    await settle()
    expect(dialog().user).toEqual(user)
    expect(dialog().error).toContain("Unable to delete user.")
    expect(dialog().pending).toBe(false)
    expect(table().page?.items).toEqual([user])
    expect(harness.refetch).not.toHaveBeenCalled()
  })

  it("refreshes NOT_FOUND but keeps the dialog with an explanation", async () => {
    harness.deleteUser.mockResolvedValue({ userId: user.userId, outcome: "NOT_FOUND" })
    table().onDelete(user)
    dialog().onConfirm()
    await settle()
    expect(dialog().user).toEqual(user)
    expect(dialog().error).toContain("User not found.")
    expect(harness.refetch).toHaveBeenCalledTimes(1)
  })

  it("moves from the emptied last page to the backend's last available page, preserving filters", async () => {
    toolbar().onSearchChange("mock")
    toolbar().onSearchClick()
    toolbar().onBanFilterChange("NOT_BLOCKED")
    table().onSort("username")
    pagination().onPageChange(3)
    table().onDelete(user)
    harness.deleteUser.mockResolvedValue({ userId: user.userId, outcome: "DELETED" })
    harness.refetch.mockResolvedValue({ data: { superadminUsers: page(harness.input as UsersInput, 16) } })
    dialog().onConfirm()
    await settle()
    render()
    expect(harness.input).toEqual({
      page: 2,
      pageSize: 8,
      searchUsername: "mock",
      sort: "USERNAME_ASC",
      banFilter: "NOT_BLOCKED",
    })
  })

  it("handles ALREADY_DELETED idempotently and reports refresh failure separately", async () => {
    harness.deleteUser.mockResolvedValue({ userId: user.userId, outcome: "ALREADY_DELETED" })
    harness.refetch.mockRejectedValue(new Error("Mock refresh failure"))
    table().onDelete(user)
    dialog().onConfirm()
    await settle()
    expect(dialog().user).toBeNull()
    expect(dialog().error).toBe("")
    expect(JSON.stringify(render())).toContain("The users list could not be refreshed.")
    expect(JSON.stringify(render())).not.toContain("User was already deleted")
    expect(harness.deleteUser).toHaveBeenCalledTimes(1)
    expect(harness.refetch).toHaveBeenCalledTimes(1)
  })

  it("keeps page 1 when deletion empties the entire catalog", async () => {
    harness.deleteUser.mockResolvedValue({ userId: user.userId, outcome: "DELETED" })
    table().onDelete(user)
    harness.refetch.mockResolvedValue({ data: { superadminUsers: page(harness.input as UsersInput, 0) } })
    dialog().onConfirm()
    await settle()
    render()
    expect((harness.input as UsersInput).page).toBe(1)
  })
})
