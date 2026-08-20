export type SettingsTab = "info" | "devices" | "subscriptions" | "payments"

export const PAGES = {
  CONFIRM_EMAIL: "/confirm-email",
  FORGOT_PASSWORD: "/forgot-password",
  LOGIN: "/login",
  PASSWORD_RECOVERY: "/password-recovery",
  PASSWORD_RECOVERY_EXPIRED: "/password-recovery-expired",
  PRIVACY_POLICY: "/privacy-policy",
  REGISTRATION: "/register",
  VERIFICATION: "/verification-expired",

  FEED: "/",
  CREATE: "/create",
  MESSENGER: "/messenger",
  SEARCH: "/search",
  STATISTICS: "/statistics",
  FAVORITES: "/favorites",

  PROFILE: "/profile",
  TO_PROFILE: (id: string = "[userId]") => `/profile/${id}`,

  SETTINGS: (part: SettingsTab = "info") => `/settings?part=${part}`,
} as const

export const AUTH_PAGES = [PAGES.LOGIN, PAGES.REGISTRATION, PAGES.FORGOT_PASSWORD, PAGES.VERIFICATION] as string[]

export const PROTECTED_PAGES = [
  PAGES.CREATE,
  PAGES.MESSENGER,
  PAGES.SEARCH,
  PAGES.STATISTICS,
  PAGES.FAVORITES,
  "/settings",
] as string[]
