import { Children, isValidElement, type ComponentProps, type ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SelectBox } from "@/shared/ui/SelectBox"
import { TextArea } from "@/shared/ui/TextArea"
import { BanUserDialog } from "@/features/superadmin-users/ui/BanUserDialog"

const hooks = vi.hoisted(() => ({ values: [] as unknown[], index: 0 }))
vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useState: (initial: unknown) => {
    const index = hooks.index++
    if (!(index in hooks.values)) hooks.values[index] = initial
    return [
      hooks.values[index],
      (value: unknown) => {
        hooks.values[index] = value
      },
    ]
  },
}))
const confirm = vi.fn()
const close = vi.fn()
let pending = false
let error = ""
function render() {
  hooks.index = 0
  return BanUserDialog({
    user: {
      userId: "mock-user",
      username: "mock_username",
      profileUrl: null,
      state: "ACTIVE",
      createdAt: "2026-11-12T00:00:00.000Z",
    },
    pending,
    error,
    onClose: close,
    onConfirm: confirm,
  })
}
function child<T>(type: unknown): T {
  const item = Children.toArray(render().props.children).find((item) => isValidElement(item) && item.type === type)
  if (!isValidElement<T>(item)) throw new Error("Child missing")
  return item.props
}
function button(index: number) {
  const footer = render().props.footer
  if (!isValidElement<{ children: ReactNode }>(footer)) throw new Error("Footer missing")
  const item = Children.toArray(footer.props.children)[index]
  if (!isValidElement<{ onClick: () => void; disabled: boolean; children: ReactNode }>(item))
    throw new Error("Button missing")
  return item.props
}
function select(code: string) {
  child<ComponentProps<typeof SelectBox>>(SelectBox).onChange(code)
}
function text(value: string) {
  child<ComponentProps<typeof TextArea>>(TextArea).onChange?.({ target: { value } } as Parameters<
    NonNullable<ComponentProps<typeof TextArea>["onChange"]>
  >[0])
}
beforeEach(() => {
  hooks.values = []
  confirm.mockReset()
  close.mockReset()
  pending = false
  error = ""
})

describe("Ban user dialog (local callback checks)", () => {
  it.each(["No", "close"])("%s closes without confirmation", (action) => {
    if (action === "No") button(0).onClick()
    else render().props.onClose()
    expect(close).toHaveBeenCalledTimes(1)
    expect(confirm).not.toHaveBeenCalled()
  })
  it("requires an explicit reason and keeps exact reason labels", () => {
    expect(child<ComponentProps<typeof SelectBox>>(SelectBox).options.map((item) => item.label)).toEqual([
      "Bad behavior",
      "Advertising placement",
      "Another reason",
    ])
    button(1).onClick()
    expect(confirm).not.toHaveBeenCalled()
    expect(JSON.stringify(render().props.children)).toContain("Select a reason")
  })
  it.each(["BAD_BEHAVIOR", "ADVERTISING_PLACEMENT"])("confirms %s without a text field", (code) => {
    select(code)
    expect(() => child(TextArea)).toThrow()
    button(1).onClick()
    expect(confirm).toHaveBeenCalledExactlyOnceWith({ code })
  })
  it("requires nonblank custom text, trims it, and clears it when switching reasons", () => {
    select("ANOTHER_REASON")
    text("  ")
    button(1).onClick()
    expect(confirm).not.toHaveBeenCalled()
    expect(child<ComponentProps<typeof TextArea>>(TextArea).error).toBe("Enter a reason.")
    text("  Mock reason  ")
    button(1).onClick()
    expect(confirm).toHaveBeenCalledExactlyOnceWith({ code: "ANOTHER_REASON", text: "Mock reason" })
    select("BAD_BEHAVIOR")
    select("ANOTHER_REASON")
    expect(child<ComponentProps<typeof TextArea>>(TextArea).value).toBe("")
  })
  it("counts Unicode code points rather than UTF-16 units", () => {
    select("ANOTHER_REASON")
    text("😀".repeat(501))
    button(1).onClick()
    expect(confirm).not.toHaveBeenCalled()
    expect(child<ComponentProps<typeof TextArea>>(TextArea).error).toContain("500")
    text("😀".repeat(500))
    button(1).onClick()
    expect(confirm).toHaveBeenCalledTimes(1)
  })
  it("locks controls while pending and keeps server errors visible", () => {
    select("ANOTHER_REASON")
    pending = true
    expect(render().props.isCloseDisabled).toBe(true)
    expect(button(0).disabled).toBe(true)
    expect(button(1).disabled).toBe(true)
    expect(button(1).children).toBe("Banning…")
    expect(child<ComponentProps<typeof SelectBox>>(SelectBox).disabled).toBe(true)
    expect(child<ComponentProps<typeof TextArea>>(TextArea).disabled).toBe(true)
    button(1).onClick()
    expect(confirm).not.toHaveBeenCalled()
    pending = false
    error = "Mock GraphQL failure"
    expect(JSON.stringify(render().props.children)).toContain(error)
  })
})
