"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLogoutMutation } from "@/features/auth/api/use-logout.mutation"
import { Button } from "@/shared/ui/Button"
import { Sidebar } from "@/shared/ui/Sidebar"
import { Modal } from "@/shared/ui"
import { useDeletePostMutation } from "@/features/posts/api/use-delete-post-mutation"

const mockPosts = [
  {
    id: "post-1",
    description: "My first post",
    imageUrl: "/images/mock-post.jpg",
    comments: [],
  },
  {
    id: "post-2",
    description: "Another post",
    imageUrl: "/images/mock-post.jpg",
    comments: [],
  },
]

export default function Profile() {
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const { mutate: logout, isPending } = useLogoutMutation()

  const { mutate: deletePost } = useDeletePostMutation()
  const [posts, setPosts] = useState(mockPosts)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const handleDeletePost = () => {
    console.log("delete post")
    if (!selectedPostId) return
    // await deletePost({postId})
    setPosts((prev) => prev.filter((post) => post.id !== selectedPostId))
    setSelectedPostId(null)
  }

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push("/login")
      },
      onError: (error) => {
        console.error("Failed to logout:", error)
        setShowConfirm(false)
      },
    })
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar style={{ top: "60px" }} onLogout={() => setShowConfirm(true)} />

      <main style={{ paddingTop: "80px", paddingLeft: "300px" }}>
        <h1 style={{ color: "red" }}>Profile</h1>
        {posts.map((post) => (
          <div style={{ display: "flex", gap: "10px" }} key={post.id}>
            <p>{post.description}</p>
            <button onClick={() => setSelectedPostId(post.id)}>Delete</button>
          </div>
        ))}
        <Modal
          title="Delete Post"
          isOpen={!!selectedPostId}
          onClose={() => setSelectedPostId(null)}
          onCancel={() => setSelectedPostId(null)}
          onConfirm={handleDeletePost}
          confirmText="Yes"
          cancelText="No"
          showCancelButton
        >
          <p>Are you sure you want to delete this post?</p>
        </Modal>

        {showConfirm && (
          <div>
            <p style={{ fontSize: "14px", marginBottom: "18px" }}>
              Are you sure you want to log out of your account &apos;chelbik email:chelbik@google.com&apos;?
            </p>

            <div style={{ display: "flex", gap: "24px" }}>
              <Button variant="outlined" onClick={() => setShowConfirm(false)} disabled={isPending}>
                No
              </Button>
              <Button onClick={handleLogout} disabled={isPending}>
                {isPending ? "Logging out..." : "Yes"}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
