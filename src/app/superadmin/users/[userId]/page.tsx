import { SuperadminUserDetails } from "@/features/superadmin-users"

export default async function SuperadminUserDetailsPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  return <SuperadminUserDetails key={userId} userId={userId} />
}
