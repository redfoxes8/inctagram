import { MainScreen } from "@/screens/main-page"
import { SidebarWidget } from "@/widgets/sidebar-widget"

export const revalidate = 60

async function getUsersCount(): Promise<number> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/count`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) throw new Error("Failed to fetch users count")

  const data = await res.json()
  return data.count ?? data
}

async function getLatestPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/posts/latest`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) throw new Error("Failed to fetch latest posts")

  return res.json()
}

export default async function Home() {
  let totalUsers = 1348
  let posts = []

  try {
    const [fetchedUsersCount, fetchedPosts] = await Promise.all([getUsersCount(), getLatestPosts()])

    totalUsers = fetchedUsersCount
    posts = fetchedPosts
  } catch (error) {
    console.error("Бэкенд недоступен, Next.js использует фолбек-данные:", error)
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
