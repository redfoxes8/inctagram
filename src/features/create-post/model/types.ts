import { paths } from "@/shared/api/schema"

export type UploadUrlResponse =
  paths["/api/v1/posts/images/upload-url"]["post"]["responses"]["200"]["content"]["application/json"]

export type CreatePostPayload = paths["/api/v1/posts"]["post"]["requestBody"]["content"]["application/json"]

export type CreatePostStep = "SELECT" | "CROP" | "FILTERS" | "PUBLICATION"

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export interface ImageItem {
  id: string
  file: File
  croppedImage: string | null
  cropArea: CropArea | null
  filter: string | null
}

export interface CreatePostData {
  images: ImageItem[]
  currentImageIndex: number
  description: string
  location: string
}
