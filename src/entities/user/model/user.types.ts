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

export type ProfileStore = {
  cachedProfile: PostOwner | null
  setCachedProfile: (profile: PostOwner | null) => void
}

export type ProfileHeaderUser = {
  id: string
  username: string
  avatarUrl: string | null
  aboutMe: string | null
  email?: string
  followersCount: number
  followingCount: number
  postsCount: number
}
