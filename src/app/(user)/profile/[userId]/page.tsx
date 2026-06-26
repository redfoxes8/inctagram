import { ProfilePage } from "@/screens/profile-page/ProfilePage"

type Props = {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ postId?: string }>
}

export default async function Page({ params, searchParams }: Props) {
  const { userId } = await params
  const { postId } = await searchParams

  return <ProfilePage userId={userId} postId={postId} />
}
