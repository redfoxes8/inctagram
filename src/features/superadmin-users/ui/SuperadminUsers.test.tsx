import { Children, isValidElement, type ComponentProps, type ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Pagination } from "@/shared/ui/Pagination"
import type { SuperadminUser, UsersInput, UsersPage } from "@/features/superadmin-users/model/types"
import { SuperadminUsers } from "@/features/superadmin-users/ui/SuperadminUsers"
import { UsersToolbar } from "@/features/superadmin-users/ui/UsersToolbar"
import { UsersTable } from "@/features/superadmin-users/ui/UsersTable"
import { DeleteUserDialog } from "@/features/superadmin-users/ui/DeleteUserDialog"
import { BanUserDialog } from "@/features/superadmin-users/ui/BanUserDialog"
import { UnbanUserDialog } from "@/features/superadmin-users/ui/UnbanUserDialog"

// Exercise parent handlers with a deterministic hook harness; no DOM or network.
const harness = vi.hoisted(() => ({
  states: [] as unknown[],
  refs: [] as { current: unknown }[],
  stateIndex: 0,
  refIndex: 0,
  input: undefined as unknown,
  deleteUser: vi.fn(),
  banUser: vi.fn(),
  unbanUser: vi.fn(),
  response: undefined as UsersPage | undefined,
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
vi.mock("@/features/superadmin-users/api/ban-user-api", () => ({ useBanSuperadminUser: () => harness.banUser }))
vi.mock("@/features/superadmin-users/api/unban-user-api", () => ({ useUnbanSuperadminUser: () => harness.unbanUser }))
vi.mock("@/features/superadmin-users/api/users-api", async (original) => ({
  ...(await original<typeof import("@/features/superadmin-users/api/users-api")>()),
  useSuperadminUsers: (input: UsersInput) => {
    harness.input = input
    return { data: { superadminUsers: harness.response ?? page(input) }, loading: false, refetch: harness.refetch }
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
const banDialog = () => props<ComponentProps<typeof BanUserDialog>>(render(), BanUserDialog)
const unbanDialog = () => props<ComponentProps<typeof UnbanUserDialog>>(render(), UnbanUserDialog)
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
  harness.banUser.mockReset()
  harness.unbanUser.mockReset()
  harness.response = undefined
  harness.refetch
    .mockReset()
    .mockImplementation(async () => ({ data: { superadminUsers: page(harness.input as UsersInput) } }))
})

describe("UC-1 ban confirmation and refreshed catalog", () => {
  it.each(["No", "close"])("%s cancels without a mutation or refetch", (action) => {
    table().onBan(user)
    const modal = BanUserDialog(banDialog())
    if (action === "close") modal.props.onClose()
    else {
      const footer = modal.props.footer
      if (!isValidElement<{ children: ReactNode }>(footer)) throw new Error("Footer missing")
      const no = Children.toArray(footer.props.children)[0]
      if (!isValidElement<{ onClick: () => void }>(no)) throw new Error("No button missing")
      no.props.onClick()
    }
    expect(() => banDialog()).toThrow("Component missing")
    expect(harness.banUser).not.toHaveBeenCalled()
    expect(harness.refetch).not.toHaveBeenCalled()
  })

  it.each([
    { code: "BAD_BEHAVIOR" as const },
    { code: "ADVERTISING_PLACEMENT" as const },
    { code: "ANOTHER_REASON" as const, text: "Mock reason" },
  ])("confirms $code once and refreshes without resetting list parameters", async (reason) => {
    toolbar().onSearchChange("mock")
    toolbar().onSearchClick()
    toolbar().onBanFilterChange("NOT_BLOCKED")
    table().onSort("username")
    pagination().onPageSizeChange(4)
    pagination().onPageChange(2)
    table().onBan(user)
    let complete!: (value: { userId: string; outcome: string }) => void
    harness.banUser.mockReturnValue(
      new Promise((resolve) => {
        complete = resolve
      }),
    )
    const confirm = banDialog().onConfirm
    confirm(reason)
    confirm(reason)
    banDialog().onClose()
    expect(harness.banUser).toHaveBeenCalledExactlyOnceWith(user.userId, reason)
    expect(banDialog().pending).toBe(true)
    expect(pagination().disabled).toBe(true)
    complete({ userId: user.userId, outcome: "BLOCKED" })
    await settle()
    expect(() => banDialog()).toThrow("Component missing")
    expect(harness.refetch).toHaveBeenCalledTimes(1)
    expect(harness.input).toEqual({
      page: 2,
      pageSize: 4,
      searchUsername: "mock",
      sort: "USERNAME_ASC",
      banFilter: "NOT_BLOCKED",
    })
  })

  it("keeps the dialog and original row after a mutation error", async () => {
    harness.banUser.mockRejectedValue(new Error("Mock failure"))
    table().onBan(user)
    banDialog().onConfirm({ code: "BAD_BEHAVIOR" })
    await settle()
    expect(banDialog().pending).toBe(false)
    expect(banDialog().error).toContain("Unable to ban user.")
    expect(table().page?.items).toEqual([user])
    expect(harness.refetch).not.toHaveBeenCalled()
  })

  it.each(["NOT_FOUND", "USER_DELETED"])("does not pretend success for %s", async (outcome) => {
    harness.banUser.mockResolvedValue({ userId: user.userId, outcome })
    table().onBan(user)
    banDialog().onConfirm({ code: "BAD_BEHAVIOR" })
    await settle()
    expect(banDialog().error).not.toBe("")
    expect(harness.refetch).toHaveBeenCalledTimes(1)
  })

  it("accepts ALREADY_BLOCKED and corrects a page emptied by the NOT_BLOCKED filter", async () => {
    toolbar().onBanFilterChange("NOT_BLOCKED")
    pagination().onPageChange(3)
    table().onBan(user)
    harness.banUser.mockResolvedValue({ userId: user.userId, outcome: "ALREADY_BLOCKED" })
    harness.refetch.mockResolvedValue({ data: { superadminUsers: page(harness.input as UsersInput, 16) } })
    banDialog().onConfirm({ code: "BAD_BEHAVIOR" })
    await settle()
    render()
    expect((harness.input as UsersInput).page).toBe(2)
    expect((harness.input as UsersInput).banFilter).toBe("NOT_BLOCKED")
    expect(() => banDialog()).toThrow("Component missing")
  })

  it("does not offer another ban for a row already marked BLOCKED", () => {
    table().onBan({ ...user, state: "BLOCKED" })
    expect(() => banDialog()).toThrow("Component missing")
    expect(harness.banUser).not.toHaveBeenCalled()
  })
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

describe("UC-2 un-ban confirmation and Blocked filtering", () => {
  const blocked: SuperadminUser = { ...user, state: "BLOCKED" }

  it.each(["No", "close"])("%s cancels without a mutation or list request", (action) => {
    table().onUnban(blocked)
    const modal = UnbanUserDialog(unbanDialog())
    if (action === "close") modal.props.onClose()
    else {
      const footer = modal.props.footer
      if (!isValidElement<{ children: ReactNode }>(footer)) throw new Error("Footer missing")
      const no = Children.toArray(footer.props.children)[0]
      if (!isValidElement<{ onClick: () => void }>(no)) throw new Error("No button missing")
      no.props.onClick()
    }
    expect(() => unbanDialog()).toThrow("Component missing")
    expect(harness.unbanUser).not.toHaveBeenCalled()
    expect(harness.refetch).not.toHaveBeenCalled()
  })

  it("locks repeated confirmation and closing until completion, then refreshes exactly once", async () => {
    table().onUnban(blocked)
    let complete!: (value: { userId: string; outcome: string }) => void
    harness.unbanUser.mockReturnValue(
      new Promise((resolve) => {
        complete = resolve
      }),
    )
    const confirm = unbanDialog().onConfirm
    confirm()
    confirm()
    unbanDialog().onClose()
    table().onBan(user)
    table().onDelete(user)
    expect(harness.unbanUser).toHaveBeenCalledExactlyOnceWith(blocked.userId)
    expect(unbanDialog().pending).toBe(true)
    expect(UnbanUserDialog(unbanDialog()).props.isCloseDisabled).toBe(true)
    expect(pagination().disabled).toBe(true)
    expect(banDialog).toThrow("Component missing")
    expect(dialog().user).toBeNull()
    complete({ userId: blocked.userId, outcome: "UNBLOCKED" })
    await settle()
    expect(unbanDialog).toThrow("Component missing")
    expect(harness.refetch).toHaveBeenCalledTimes(1)
  })

  it("uses the refreshed Blocked result to remove the unblocked row and preserves query parameters", async () => {
    toolbar().onSearchChange("mock")
    toolbar().onSearchClick()
    toolbar().onBanFilterChange("BLOCKED")
    table().onSort("username")
    pagination().onPageSizeChange(4)
    render()
    harness.response = { ...page(harness.input as UsersInput), items: [blocked] }
    table().onUnban(blocked)
    harness.unbanUser.mockResolvedValue({ userId: blocked.userId, outcome: "UNBLOCKED" })
    harness.refetch.mockImplementation(async () => {
      harness.response = page(harness.input as UsersInput, 0)
      return { data: { superadminUsers: harness.response } }
    })
    unbanDialog().onConfirm()
    await settle()
    expect(table().page?.items).toEqual([])
    expect(harness.input).toEqual({
      page: 1,
      pageSize: 4,
      searchUsername: "mock",
      sort: "USERNAME_ASC",
      banFilter: "BLOCKED",
    })
    expect(harness.refetch).toHaveBeenCalledTimes(1)
  })

  it("moves from an emptied last Blocked page to the backend's last available page", async () => {
    toolbar().onBanFilterChange("BLOCKED")
    pagination().onPageChange(3)
    table().onUnban(blocked)
    harness.unbanUser.mockResolvedValue({ userId: blocked.userId, outcome: "ALREADY_ACTIVE" })
    harness.refetch.mockResolvedValue({ data: { superadminUsers: page(harness.input as UsersInput, 16) } })
    unbanDialog().onConfirm()
    await settle()
    render()
    expect(harness.input).toEqual({
      page: 2,
      pageSize: 8,
      searchUsername: "",
      sort: "CREATED_AT_DESC",
      banFilter: "BLOCKED",
    })
    expect(unbanDialog).toThrow("Component missing")
  })

  it("keeps a failed un-ban and the original blocked row visible without refetch or fake success", async () => {
    render()
    harness.response = { ...page(harness.input as UsersInput), items: [blocked] }
    harness.unbanUser.mockRejectedValue(new Error("Mock failure"))
    table().onUnban(blocked)
    unbanDialog().onConfirm()
    await settle()
    expect(unbanDialog().error).toContain("Unable to un-ban user.")
    expect(unbanDialog().pending).toBe(false)
    expect(table().page?.items).toEqual([blocked])
    expect(harness.refetch).not.toHaveBeenCalled()
  })

  it.each(["NOT_FOUND", "USER_DELETED"])("does not claim success for %s", async (outcome) => {
    harness.unbanUser.mockResolvedValue({ userId: blocked.userId, outcome })
    table().onUnban(blocked)
    unbanDialog().onConfirm()
    await settle()
    expect(unbanDialog().error).not.toBe("")
    expect(harness.refetch).toHaveBeenCalledTimes(1)
  })

  it("distinguishes a failed refresh after success without repeating the mutation", async () => {
    harness.unbanUser.mockResolvedValue({ userId: blocked.userId, outcome: "UNBLOCKED" })
    harness.refetch.mockRejectedValue(new Error("Mock refresh error"))
    table().onUnban(blocked)
    unbanDialog().onConfirm()
    await settle()
    expect(unbanDialog).toThrow("Component missing")
    expect(JSON.stringify(render())).toContain("The users list could not be refreshed.")
    expect(harness.unbanUser).toHaveBeenCalledTimes(1)
    expect(harness.refetch).toHaveBeenCalledTimes(1)
  })

  it("does not open un-ban confirmation for an ACTIVE row", () => {
    table().onUnban(user)
    expect(unbanDialog).toThrow("Component missing")
    expect(harness.unbanUser).not.toHaveBeenCalled()
  })
})
