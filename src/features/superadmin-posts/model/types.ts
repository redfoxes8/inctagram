export type SuperadminPost = {
  postId: string
  userId: string
  username: string | null
  description: string
  publishedAt: string
  images: { fileId: string; order: number; url: string | null }[]
}
export type PostsInput = { first: number; searchUsername: string; after?: string }
export type PostsPage = {
  items: SuperadminPost[]
  pageInfo: { endCursor: string | null; hasNextPage: boolean }
}
export type PostsEvent = {
  kind: "READY" | "POST_PUBLISHED" | "RESYNC_REQUIRED"
  post: SuperadminPost | null
}

export function mergePosts(existing: SuperadminPost[], incoming: SuperadminPost[], search: string) {
  const posts = new Map(existing.map((post) => [post.postId, post]))
  for (const post of incoming) posts.set(post.postId, post)
  const normalized = search.trim().toLowerCase()
  return [...posts.values()]
    .filter((post) => !normalized || post.username?.toLowerCase().includes(normalized))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || b.postId.localeCompare(a.postId))
}
