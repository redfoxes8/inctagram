import { Container } from "@/shared/ui"
import { PostCard } from "@/widgets/post-card"
import s from "./MainScreen.module.css"
import { PostItem, UsersCountResponse } from "@/entities/post/model/post.types"

type MainScreenProps = {
  totalUsers: UsersCountResponse
  serverPosts: PostItem[]
}

export function MainScreen({ totalUsers, serverPosts }: MainScreenProps) {
  const digits = String(totalUsers.totalCount).padStart(6, "0").split("")

  return (
    <Container>
      <div className={s.wrapper}>
        <div className={s.head}>
          <span className="h2">Registered users: </span>
          <div className={s.counter}>
            {digits.map((digit, index) => (
              <div key={index} className={s.digitBox}>
                <span className="h2">{digit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={s.content}>
          {serverPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </Container>
  )
}
