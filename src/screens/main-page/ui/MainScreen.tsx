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

export const MOCK_POSTS: PostItem[] = [
  {
    id: "post-1",
    ownerId: "user-1",
    description:
      "Начал изучать Next.js 16 и architecture Feature-Driven Design. Сложно, но безумно интересно! Разделение на слои реально помогает держать код в чистоте, особенно когда проект начинает разрастаться.",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
    images: [
      {
        id: "img-1-1",
        fileId: "f1",
        url: "https://i.pinimg.com/736x/c8/cc/24/c8cc24bba37a25c009647b8875aae0e3.jpg",
        order: 1,
      },
      {
        id: "img-1-2",
        fileId: "f2",
        url: "https://trikky.ru/wp-content/blogs.dir/1/files/2020/07/18/unnamed-2.jpg",
        order: 2,
      },
    ],
    owner: {
      id: "user-1",
      username: "frontend_dev",
      avatarUrl: "https://i.pinimg.com/736x/c8/cc/24/c8cc24bba37a25c009647b8875aae0e3.jpg",
    },
  },
  {
    id: "post-2",
    ownerId: "user-2",
    description:
      "Утренний кофе и порция код-ревью. Сегодня на повестке дня оптимизация серверного рендеринга и настройка Incremental Static Regeneration (ISR). Всем продуктивного дня!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    images: {
      id: "img-2-1",
      fileId: "f3",
      url: "https://i.pinimg.com/736x/c8/cc/24/c8cc24bba37a25c009647b8875aae0e3.jpg",
      order: 1,
    },
    owner: {
      id: "user-2",
      username: "coffee_coder",
      avatarUrl: "https://i.pinimg.com/736x/c8/cc/24/c8cc24bba37a25c009647b8875aae0e3.jpg",
    },
  },
  {
    id: "post-3",
    ownerId: "user-3",
    description:
      "Развернул стейдж, а бэкенд решил прилечь отдохнуть 🛌 Пишем моки, тестируем интерфейсы в изоляции. Storybook в таких ситуациях просто спасает.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
    images: [
      {
        id: "img-3-1",
        fileId: "f4",
        url: "https://i.pinimg.com/736x/c8/cc/24/c8cc24bba37a25c009647b8875aae0e3.jpg",
        order: 1,
      },
      {
        id: "img-3-2",
        fileId: "f5",
        url: "https://trikky.ru/wp-content/blogs.dir/1/files/2020/07/18/unnamed-2.jpg",
        order: 2,
      },
      {
        id: "img-3-3",
        fileId: "f6",
        url: "https://forum.yesai.su/uploads/monthly_2026_01/large.file_1429688.jpg.3caa5a895a82bc5c48f1c89a8e014118.jpg",
        order: 3,
      },
    ],
    owner: {
      id: "user-3",
      username: "bug_hunter",
      avatarUrl: "https://i.pinimg.com/736x/c8/cc/24/c8cc24bba37a25c009647b8875aae0e3.jpg",
    },
  },
  {
    id: "post-4",
    ownerId: "user-4",
    description:
      "Настраиваю дизайн-систему на Radix UI. Компоненты получаются доступными и очень гибкими под кастомизацию стилей.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    images: {
      id: "img-4-1",
      fileId: "f7",
      url: "https://i.pinimg.com/736x/c8/cc/24/c8cc24bba37a25c009647b8875aae0e3.jpg",
      order: 1,
    },
    owner: {
      id: "user-4",
      username: "ui_designer",
      avatarUrl: "https://i.pinimg.com/736x/c8/cc/24/c8cc24bba37a25c009647b8875aae0e3.jpg",
    },
  },
]

type MainScreenProps = {
  totalUsers: number
  serverPosts?: PostItem[]
}

export function MainScreen({ totalUsers, serverPosts = [] }: MainScreenProps) {
  const postsToRender: PostItem[] = serverPosts && serverPosts.length > 0 ? serverPosts : MOCK_POSTS
  //Поправить как только бэк вернет посты убрать мок посты

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
            {postsToRender.slice(0, 4).map(
              (
                mockPost: PostItem, //Поправить описания как только посты будут приходить с сервера
              ) => (
                <PostCard key={mockPost.id} post={mockPost} />
              ),
            )}
          </div>
        </div>
      </Container>
    </>
  )
}
