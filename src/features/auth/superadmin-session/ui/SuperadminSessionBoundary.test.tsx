import { beforeEach, describe, expect, it, vi } from "vitest"
import { SuperadminSessionBoundary } from "@/features/auth/superadmin-session/ui/SuperadminSessionBoundary"

const harness = vi.hoisted(() => ({
  state: null as unknown,
  ref: { current: null as unknown },
  effect: undefined as (() => () => void) | undefined,
  restore: vi.fn(),
  client: {},
  router: { replace: vi.fn() },
}))
vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useState: () => [
    harness.state,
    (value: unknown) => {
      harness.state = value
    },
  ],
  useRef: () => harness.ref,
  useEffect: (effect: () => () => void) => {
    harness.effect = effect
  },
}))
vi.mock("@apollo/client/react", () => ({ useApolloClient: () => harness.client }))
vi.mock("next/navigation", () => ({ useRouter: () => harness.router }))
vi.mock("@/features/auth/api/superadmin-session", () => ({
  restoreSuperadminSession: (client: unknown) => harness.restore(client),
  isSuperadminSessionUnauthenticated: (error: unknown) => error === "UNAUTHENTICATED",
}))
function render() {
  return SuperadminSessionBoundary({ children: "Protected content" })
}
function runEffect() {
  if (!harness.effect) throw new Error("Effect missing")
  return harness.effect()
}
async function settle() {
  await Promise.resolve()
  await Promise.resolve()
}

beforeEach(() => {
  harness.state = null
  harness.ref.current = null
  harness.restore.mockReset()
  harness.router.replace.mockReset()
})

describe("protected-layout bootstrap lifecycle (mocked hook lifecycle)", () => {
  it("reuses one pending request across Strict Mode effect replay and later rerenders", async () => {
    let complete!: () => void
    harness.restore.mockReturnValue(
      new Promise<void>((resolve) => {
        complete = resolve
      }),
    )
    expect(render()).not.toBe("Protected content")
    const cleanup = runEffect()
    cleanup()
    runEffect()
    expect(harness.restore).toHaveBeenCalledTimes(1)
    complete()
    await settle()
    expect(render()).toBe("Protected content")
    runEffect()
    await settle()
    expect(harness.restore).toHaveBeenCalledTimes(1)
    expect(harness.router.replace).not.toHaveBeenCalled()
  })

  it("keeps a technical failure visible without logout or retry on effect replay", async () => {
    harness.restore.mockRejectedValue(new Error("Mock outage"))
    render()
    runEffect()()
    runEffect()
    await settle()
    expect(JSON.stringify(render())).toContain("Unable to restore the admin session")
    runEffect()
    await settle()
    expect(harness.restore).toHaveBeenCalledTimes(1)
    expect(harness.router.replace).not.toHaveBeenCalled()
  })

  it("redirects only an unauthenticated session and blocks protected content", async () => {
    harness.restore.mockRejectedValue("UNAUTHENTICATED")
    render()
    runEffect()
    await settle()
    expect(harness.router.replace).toHaveBeenCalledExactlyOnceWith("/superadmin/sign-in")
    expect(render()).not.toBe("Protected content")
    expect(harness.restore).toHaveBeenCalledTimes(1)
  })

  it("ignores completion after the protected layout unmounts", async () => {
    let complete!: () => void
    harness.restore.mockReturnValue(
      new Promise<void>((resolve) => {
        complete = resolve
      }),
    )
    render()
    runEffect()()
    complete()
    await settle()
    expect(harness.state).toBeNull()
    expect(harness.router.replace).not.toHaveBeenCalled()
  })
})
