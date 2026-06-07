import type {
  components,
  SchemaGetFeedResponseDto,
  SchemaPostResponseDto,
  SchemaUserMeResponseDto,
} from "@/shared/api/schema"

export type UpdatePostResponse = components["schemas"]["CreatePostResponseDto"]
export type UpdatePostPayload = components["schemas"]["UpdatePostDto"]

export type EditPostData = {
  post: SchemaPostResponseDto
  user: SchemaUserMeResponseDto
}

export type MutationContext = {
  previousFeed: SchemaGetFeedResponseDto | undefined
  previousPost: UpdatePostResponse | undefined
}
