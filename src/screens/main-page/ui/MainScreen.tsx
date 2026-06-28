import { Container } from "@/shared/ui"
import s from "./MainScreen.module.css"
import clsx from "clsx"
import { PostCard } from "@/widgets/post-card"

type PostImage = {
  id: string
  fileId: string
  url: string
  order: number
}

type PostOwner = {
  id: string
  username: string
  avatarUrl?: string
}

type PostItem = {
  id: string
  ownerId: string
  description: string
  images: PostImage | PostImage[]
  createdAt: string
  updatedAt: string
  owner?: PostOwner
}

type MainScreenProps = {
  totalUsers: number
  serverPosts?: PostItem[]
}

export function MainScreen({ totalUsers, serverPosts = [] }: MainScreenProps) {
  const postsToRender: PostItem[] = Array.isArray(serverPosts) && serverPosts.length > 0 ? serverPosts : []

  const digits = String(totalUsers).padStart(6, "0").split("")

  return (
    <>
      <Container>
        <div className={s.wrapper}>
          <div className={s.head}>
            <span className={clsx("h2")}>Registered users: </span>

            <div className={s.counter}>
              {digits.map((digit, index) => (
                <div key={index} className={s.digitBox}>
                  <span className="h2">{digit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={s.content}>
            {postsToRender.slice(0, 4).map((post: PostItem) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </Container>
    </>
  )
}
