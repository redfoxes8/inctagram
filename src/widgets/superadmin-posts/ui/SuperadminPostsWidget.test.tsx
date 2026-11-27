import { Children, isValidElement, type ComponentProps, type ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SuperadminPostsWidget } from "@/widgets/superadmin-posts/ui/SuperadminPostsWidget"
import { SuperadminPosts } from "@/features/superadmin-posts/ui/SuperadminPosts"
import { BanUserDialog } from "@/features/superadmin-users/ui/BanUserDialog"
import type { SuperadminPost } from "@/features/superadmin-posts/model/types"

const hooks = vi.hoisted(() => ({ values: [] as unknown[], index: 0, ban: vi.fn() }))
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
  useRef: (initial: unknown) => {
    const index = hooks.index++
    if (!(index in hooks.values)) hooks.values[index] = { current: initial }
    return hooks.values[index]
  },
}))
vi.mock("@/features/superadmin-users/api/ban-user-api", () => ({ useBanSuperadminUser: () => hooks.ban }))
const post: SuperadminPost = {
  postId: "test-post",
  userId: "confirmed-author-id",
  username: "test_username",
  publishedAt: "2026-11-27T00:00:00.000Z",
  description: "Test only",
  images: [],
}
function render() {
  hooks.index = 0
  return SuperadminPostsWidget()
}
function props<T>(tree: ReactNode, type: unknown): T {
  let found: T | undefined
  Children.forEach(tree, (item) => {
    if (!isValidElement<{ children?: ReactNode }>(item)) return
    if (item.type === type) found = item.props as T
    else if (item.props.children) {
      try {
        found = props<T>(item.props.children, type)
      } catch {
        /* Continue siblings. */
      }
    }
  })
  if (!found) throw new Error("Missing component")
  return found
}
const list = () => props<ComponentProps<typeof SuperadminPosts>>(render(), SuperadminPosts)
const dialog = () => props<ComponentProps<typeof BanUserDialog>>(render(), BanUserDialog)
async function settle() {
  for (let i = 0; i < 15; i++) await Promise.resolve()
}
beforeEach(() => {
  hooks.index = 0
  hooks.values = []
  hooks.ban.mockReset()
})

describe("posts moderation composition (mocked Ban hook, no mutations sent)", () => {
  it("opens the existing dialog and cancels without calling Ban", () => {
    list().onBan(post)
    expect(dialog().user).toBe(post)
    expect(hooks.ban).not.toHaveBeenCalled()
    dialog().onClose()
    expect(dialog).toThrow("Missing component")
    expect(hooks.ban).not.toHaveBeenCalled()
  })
  it("passes the confirmed userId and existing reason once, and locks close while pending", async () => {
    let resolve!: (result: unknown) => void
    hooks.ban.mockReturnValue(
      new Promise((done) => {
        resolve = done
      }),
    )
    list().onBan({ ...post, username: null })
    const control = dialog()
    control.onConfirm({ code: "BAD_BEHAVIOR" })
    control.onConfirm({ code: "BAD_BEHAVIOR" })
    expect(hooks.ban).toHaveBeenCalledExactlyOnceWith("confirmed-author-id", { code: "BAD_BEHAVIOR" })
    expect(dialog().pending).toBe(true)
    dialog().onClose()
    expect(dialog().user.userId).toBe(post.userId)
    expect(list().banPending).toBe(true)
    resolve({ outcome: "BLOCKED" })
    await settle()
    expect(dialog).toThrow("Missing component")
    expect(list().banPending).toBe(false)
  })
  it.each(["NOT_FOUND", "USER_DELETED"])("keeps %s visible in the dialog", async (outcome) => {
    hooks.ban.mockResolvedValue({ outcome })
    list().onBan(post)
    dialog().onConfirm({ code: "ANOTHER_REASON", text: "Test-only reason" })
    await settle()
    expect(dialog().error).toContain(outcome === "NOT_FOUND" ? "not found" : "deleted")
    expect(dialog().pending).toBe(false)
  })
  it("accepts ALREADY_BLOCKED and leaves posts displayed by the feed", async () => {
    hooks.ban.mockResolvedValue({ outcome: "ALREADY_BLOCKED" })
    list().onBan(post)
    dialog().onConfirm({ code: "ADVERTISING_PLACEMENT" })
    await settle()
    expect(dialog).toThrow("Missing component")
    expect(list()).toBeDefined()
  })
})
