import { ProfilePage } from "@/screens/profile-page/ProfilePage"
import { serverClient } from "@/shared/api/client.server"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ postId?: string }>
}

async function getProfileServer(userId: string) {
  const response = await serverClient.GET(`/api/v1/profile/${userId}` as any, {})

  if (response.error) {
    console.error("❌ Ошибка SSR запроса к бэку:", response.error)
    return null
  }

  return response.data
}

async function getPostServer(postId: string) {
  const response = await serverClient.GET(
    `/api/v1/posts/${postId}` as any,
    {}
  )

  if (response.error) {
    return null
  }

  return response.data
}

export default async function Page({ params, searchParams }: Props) {
  const { userId } = await params
  const { postId } = await searchParams

const [serverProfile, serverPost] = await Promise.all([
  getProfileServer(userId),
  postId ? getPostServer(postId) : Promise.resolve(null),
])

if (!serverProfile) {
  return notFound()
}

if (postId && !serverPost) {
  return notFound()
}

  return <ProfilePage userId={userId} postId={postId} serverProfile={serverProfile} serverPost={serverPost} />
}




