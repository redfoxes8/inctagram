export type BanReasonCode = "BAD_BEHAVIOR" | "ADVERTISING_PLACEMENT" | "ANOTHER_REASON"
export type BanReasonInput =
  | { code: "BAD_BEHAVIOR" | "ADVERTISING_PLACEMENT" }
  | { code: "ANOTHER_REASON"; text: string }

// GRAPHQL_SUPERADMIN_FRONTEND_API.md, S3: trim and 1–500 Unicode code points.
export function getBanReason(code: string, text: string): BanReasonInput {
  if (code === "BAD_BEHAVIOR" || code === "ADVERTISING_PLACEMENT") return { code }
  if (code !== "ANOTHER_REASON") throw new Error("Select a reason for the ban.")
  const trimmed = text.trim()
  if (!trimmed) throw new Error("Enter a reason.")
  if (Array.from(trimmed).length > 500) throw new Error("Use no more than 500 characters.")
  return { code, text: trimmed }
}
