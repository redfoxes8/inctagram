import { Suspense } from "react"
import { ProfilePage } from "@/screens/profile-page/ProfilePage"
import { serverClient } from "@/shared/api/client.server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import type { PostItem } from "@/entities/post/model/post.types"

type Props = {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ postId?: string }>
}
export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params
  const profile = await getProfileServer(userId)

  if (!profile) {
    return {
      title: "Profile not found",
    }
  }

  return {
    title: profile.username || "Profile",
    description: profile.aboutMe || undefined,
  }
}

async function getProfileServer(userId: string) {
  const response = await serverClient.GET("/api/v1/profile/{userId}", {
    params: {
      path: { userId },
    },
  })

  if (response.error) {
    return null
  }

  return response.data
}

async function getPostServer(postId: string) {
  const response = await serverClient.GET("/api/v1/posts/{postId}", {
    params: {
      path: { postId },
    },
  })

  if (response.error) {
    return undefined
  }

  return response.data as PostItem
}

export default async function Page({ params, searchParams }: Props) {
  const { userId } = await params
  const { postId } = await searchParams

  const [serverProfile, serverPost] = await Promise.all([
    getProfileServer(userId),
    postId ? getPostServer(postId) : Promise.resolve(undefined),
  ])

  if (!serverProfile) {
    return notFound()
  }

  if (postId && !serverPost) {
    return notFound()
  }

  return (
    <Suspense fallback={null}>
      <ProfilePage userId={userId} postId={postId} serverProfile={serverProfile} serverPost={serverPost} />
    </Suspense>
  )
}
