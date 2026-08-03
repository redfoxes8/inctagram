import { PostItem, UsersCountResponse } from "@/entities/post/model/post.types"
import { MainScreen } from "@/screens/main-page"
import { serverClient } from "@/shared/api/client.server"

export const revalidate = 60

async function getUsersCount(): Promise<number> {
  const { data, error } = await serverClient.GET("/api/v1/users/count", {})

  if (error || !data) {
    throw new Error("Failed to fetch users count")
  }

  return data.totalCount ?? 0
}

async function getLatestPostsWithOwners(limit: number = 4): Promise<PostItem[]> {
  const {
    data: posts,
    error,
    response,
  } = await serverClient.GET("/api/v1/posts/latest", {
    params: {
      query: { limit },
    },
  })

  if (error || !posts) {
    throw new Error(`Failed to fetch posts: ${response?.status}`)
  }

  if (!posts?.length) return []

  const uniqueOwnerIds = Array.from(new Set(posts.map((post: PostItem) => post.ownerId)))

  const ownersData = await Promise.all(
    uniqueOwnerIds.map(async (id) => {
      try {
        const { data, error: profileError } = await serverClient.GET(`/api/v1/profile/${id}` as any, {})
        return profileError ? null : data
      } catch (err) {
        console.error(`Не удалось загрузить профиль для пользователя ${id}:`, err)
        return null
      }
    }),
  )

  const validOwners = ownersData.filter(
    (u): u is NonNullable<typeof u> => u !== null && typeof u === "object" && "id" in u,
  )

  const ownersMap = new Map(validOwners.map((u) => [u.id, u]))

  return posts.map((post: PostItem) => ({
    ...post,
    images: Array.isArray(post.images) ? post.images : post.images ? [post.images] : [],
    owner: ownersMap.get(post.ownerId),
  })) as PostItem[]
}

export default async function HomePage() {
  let totalUsers: UsersCountResponse = { totalCount: 0 }
  let posts: PostItem[] = []

  try {
    const [fetchedUsersCount, fetchedPosts] = await Promise.all([getUsersCount(), getLatestPostsWithOwners(4)])

    totalUsers = { totalCount: fetchedUsersCount }
    posts = fetchedPosts
  } catch (error) {
    console.error("Ошибка при сборке главной страницы:", error)
  }

  return <MainScreen totalUsers={totalUsers} serverPosts={posts} />
}
