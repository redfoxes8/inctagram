import { PostItem, UsersCountResponse } from "@/entities/post/model/post.types"
import { MainScreen } from "@/screens/main-page"

export const revalidate = 60
const BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL

async function getUsersCount(): Promise<number> {
  const res = await fetch(`${BASE_URL}/api/v1/users/count`)
  if (!res.ok) throw new Error("Failed to fetch users count")
  const data = await res.json()
  return data.totalCount
}

async function getLatestPostsWithOwners(limit: number = 4): Promise<PostItem[]> {
  const res = await fetch(`${BASE_URL}/api/v1/posts/latest?limit=${limit}`)
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`)

  const posts: Omit<PostItem, "owner">[] = await res.json()
  if (!posts?.length) return []

  const uniqueOwnerIds = Array.from(new Set(posts.map((post) => post.ownerId)))

  const ownersData = await Promise.all(
    uniqueOwnerIds.map(async (id) => {
      try {
        const profileRes = await fetch(`${BASE_URL}/api/v1/profile/${id}`)
        return profileRes.ok ? await profileRes.json() : null
      } catch (err) {
        console.error(`Не удалось загрузить профиль для пользователя ${id}:`, err)
        return null
      }
    }),
  )

  const validOwners = ownersData.filter((u) => u && typeof u === "object" && "id" in u)
  const ownersMap = new Map(validOwners.map((u) => [u.id, u]))

  return posts.map((post) => ({
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
