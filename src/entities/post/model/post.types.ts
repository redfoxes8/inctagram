export type PostImage = {
  id: string
  fileId: string
  url: string
  order: number
}
export type PostOwner = {
  id: string
  username: string
  firstName: string | null
  lastName: string | null
  country: string | null
  city: string | null
  aboutMe: string | null
  avatarUrl: string | null
  followersCount: number
  followingCount: number
  postsCount: number
}

export type PostItem = {
  id: string
  ownerId: string
  description: string
  images: PostImage[]
  createdAt: string
  updatedAt: string
  owner: PostOwner
}

export type UsersCountResponse = {
  totalCount: number
}
