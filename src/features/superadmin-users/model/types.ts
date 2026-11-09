// Source: docs/GRAPHQL_SUPERADMIN_FRONTEND_API.md, catalog SA-GQL-03.
export const DEFAULT_USERS_PAGE_SIZE = 8
export type BanFilter = "ALL" | "BLOCKED" | "NOT_BLOCKED"
export type UsersSort = "USERNAME_ASC" | "USERNAME_DESC" | "CREATED_AT_ASC" | "CREATED_AT_DESC"

export type SuperadminUser = {
  userId: string
  username: string | null
  profileUrl: string | null
  createdAt: string
  state: "ACTIVE" | "BLOCKED"
}

export type UsersInput = {
  page: number
  pageSize: number
  searchUsername: string
  sort: UsersSort
  banFilter: BanFilter
}

export type UsersPage = {
  items: SuperadminUser[]
  totalCount: number
  pageInfo: { page: number; pageSize: number; pagesCount: number; hasNextPage: boolean }
}

export function getProfileHref(value: string | null): string | null {
  if (!value) return null
  // Accept only a backend-provided web URL or an application-relative route.
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value
  try {
    const url = new URL(value)
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : null
  } catch {
    return null
  }
}

export function formatUserDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unavailable"
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .replaceAll("/", ".")
}
