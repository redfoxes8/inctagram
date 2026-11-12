import { Children, isValidElement, type ComponentProps, type ReactNode } from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Modal } from "@/shared/ui/Modal"
import { UnbanUserDialog } from "@/features/superadmin-users/ui/UnbanUserDialog"
import { UsersTable } from "@/features/superadmin-users/ui/UsersTable"
import type { SuperadminUser } from "@/features/superadmin-users/model/types"

const user: SuperadminUser = {
  userId: "mock-user",
  username: "mock_username",
  profileUrl: null,
  createdAt: "2026-11-12T00:00:00.000Z",
  state: "BLOCKED",
}
const close = vi.fn()
const confirm = vi.fn()
const ban = vi.fn()
const unban = vi.fn()
function dialog(pending = false, error = "") {
  return UnbanUserDialog({ user, pending, error, onClose: close, onConfirm: confirm })
}
function textOf(tree: ReactNode): string {
  return Children.toArray(tree)
    .map((item) => (isValidElement<{ children?: ReactNode }>(item) ? textOf(item.props.children) : String(item)))
    .join("")
}
function button(index: number, pending = false) {
  const footer = dialog(pending).props.footer
  if (!isValidElement<{ children: ReactNode }>(footer)) throw new Error("Footer missing")
  const item = Children.toArray(footer.props.children)[index]
  if (!isValidElement<{ onClick: () => void; disabled: boolean; children: ReactNode }>(item))
    throw new Error("Button missing")
  return item.props
}
function menu(state: SuperadminUser["state"]) {
  const tree = UsersTable({
    page: {
      items: [{ ...user, state }],
      totalCount: 1,
      pageInfo: { page: 1, pageSize: 8, pagesCount: 1, hasNextPage: false },
    },
    currentPage: 1,
    pageSize: 8,
    sort: "CREATED_AT_DESC",
    loading: false,
    disabled: false,
    errorMessage: undefined,
    onSort: vi.fn(),
    onRetry: vi.fn(),
    onPreviousPage: vi.fn(),
    onDelete: vi.fn(),
    onBan: ban,
    onUnban: unban,
  })
  const items: ComponentProps<typeof DropdownMenu.Item>[] = []
  const walk = (node: ReactNode) => {
    Children.forEach(node, (item) => {
      if (!isValidElement<{ children?: ReactNode }>(item)) return
      if (item.type === DropdownMenu.Item) items.push(item.props as ComponentProps<typeof DropdownMenu.Item>)
      walk(item.props.children)
    })
  }
  walk(tree)
  return items
}
beforeEach(() => {
  close.mockReset()
  confirm.mockReset()
  ban.mockReset()
  unban.mockReset()
})

describe("un-ban dialog and conditional row menu", () => {
  it("uses shared Modal, exact confirmation, and no reason fields", () => {
    const element = dialog()
    expect(element.type).toBe(Modal)
    expect(textOf(element.props.children)).toBe("Are you sure want to un-ban mock_username?")
    expect(button(0).children).toBe("No")
    expect(button(1).children).toBe("Yes")
  })
  it.each(["No", "close"])("%s dismisses without confirmation", (action) => {
    if (action === "No") button(0).onClick()
    else dialog().props.onClose()
    expect(close).toHaveBeenCalledTimes(1)
    expect(confirm).not.toHaveBeenCalled()
  })
  it("wires Yes, locks pending controls and leaves errors visible", () => {
    button(1).onClick()
    expect(confirm).toHaveBeenCalledTimes(1)
    expect(dialog(true).props.isCloseDisabled).toBe(true)
    expect(button(0, true).disabled).toBe(true)
    expect(button(1, true).disabled).toBe(true)
    expect(button(1, true).children).toBe("Un-banning…")
    expect(textOf(dialog(false, "Mock failure").props.children)).toContain("Mock failure")
  })
  it.each(["ACTIVE", "BLOCKED"] as const)(
    "keeps Delete and More information and selects the correct action for %s",
    (state) => {
      const items = menu(state)
      expect(items.map((item) => textOf(item.children))).toEqual([
        "Delete",
        state === "BLOCKED" ? "Un-ban" : "Ban in the system",
        "More information",
      ])
      items[1]?.onSelect?.(new Event("select"))
      expect(state === "BLOCKED" ? unban : ban).toHaveBeenCalledExactlyOnceWith({ ...user, state })
      expect(state === "BLOCKED" ? ban : unban).not.toHaveBeenCalled()
    },
  )
})
