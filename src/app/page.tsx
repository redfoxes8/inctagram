import { PostItem, PostOwner, UsersCountResponse } from "@/entities/post/model/post.types"
import { MainScreen } from "@/screens/main-page"
import { SidebarWidget } from "@/widgets/sidebar-widget"

export const revalidate = 60
const BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL

const fallbackOwner: Omit<PostOwner, "id"> = {
  username: "fallbackOwner",
  firstName: "fallbackOwner",
  lastName: "fallbackOwner",
  country: "USA",
  city: "New York",
  aboutMe: "nothing this is fallback",
  avatarUrl: "https://masterpiecer-images.s3.yandex.net/32e1e1c4617a11ee9fec3a7ca4cc1bdc:upscaled",
  followersCount: 32,
  followingCount: 44,
  postsCount: 3,
}

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
    owner: ownersMap.get(post.ownerId) || { ...fallbackOwner, id: post.ownerId },
  })) as PostItem[]
}

export default async function Home() {
  let totalUsers: UsersCountResponse = { totalCount: 0 }
  let posts: PostItem[] = []

  try {
    const [fetchedUsersCount, fetchedPosts] = await Promise.all([getUsersCount(), getLatestPostsWithOwners(4)])
    totalUsers = { totalCount: fetchedUsersCount }
    posts = fetchedPosts
  } catch (error) {
    console.error("Ошибка при сборке главной страницы:", error)
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SidebarWidget />
      <main style={{ flex: 1 }}>
        <MainScreen totalUsers={totalUsers} serverPosts={posts} />
      </main>
    </div>
  )
}
