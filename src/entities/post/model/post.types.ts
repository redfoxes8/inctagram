import { components } from "@/shared/api/schema"

export type PostImage = components["schemas"]["PostImageResponseDto"]
export type PostOwner = components["schemas"]["GetProfileResponseDto"]
export type PostItemBase = components["schemas"]["PostViewType"]

export type PostItem = PostItemBase & {
  owner?: PostOwner | null
}

export type PostItemServer = PostItemBase

export type UsersCountResponse = {
  totalCount: number
}

export type CreatePostRequest = components["schemas"]["CreatePostDto"]
export type CreatePostResponse = components["schemas"]["CreatePostResponseDto"]
export type UpdatePostRequest = components["schemas"]["UpdatePostDto"]
export type GetFeedResponse = components["schemas"]["GetFeedResponseDto"]

export type PostsResponse = {
  posts: PostItem[]
  nextCursor?: string
  hasMore: boolean
}
