import { components } from "@/shared/api/schema"

export type GetAvatarUploadUrlRequest = components["schemas"]["GetAvatarUploadUrlRequestDto"]
export type GetAvatarUploadUrlResponse = components["schemas"]["GetAvatarUploadUrlResponseDto"]
export type ConfirmAvatarRequest = components["schemas"]["ConfirmAvatarRequestDto"]
export type ConfirmAvatarResponse = components["schemas"]["ConfirmAvatarResponseDto"]

export type AllowedAvatarExtension = GetAvatarUploadUrlRequest["fileExtension"]

export interface UploadAvatarParams {
  userId?: number
}
