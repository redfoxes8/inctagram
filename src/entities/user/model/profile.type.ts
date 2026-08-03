import { components } from "@/shared/api/schema"

export type ProfileResponse = components["schemas"]["GetProfileResponseDto"]

export type ProfileRequestParams = {
  userId: string
}
