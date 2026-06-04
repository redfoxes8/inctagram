import { useMutation } from "@tanstack/react-query"
import { CreatePostPayload, UploadUrlResponse } from "../model/types"

const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken")
  }
  return null
}

export const useUploadPostImages = () => {
  return useMutation({
    mutationFn: async (images: File[]): Promise<string[]> => {
      const token = getAccessToken()

      const uploadSingleImage = async (file: File): Promise<string> => {
        const urlResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/posts/images/upload-url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            fileExtension: `.${file.name.split(".").pop()?.toLowerCase()}`,
            fileSize: file.size,
          }),
        })

        if (!urlResponse.ok) {
          throw new Error(`Не удалось получить URL для файла ${file.name}`)
        }

        const data: UploadUrlResponse = await urlResponse.json()

        if (!data.uploadUrl || !data.fileId) {
          throw new Error("Бэкенд вернул некорректные данные для загрузки")
        }

        const s3FormData = new FormData()

        if (data.uploadFields) {
          Object.entries(data.uploadFields).forEach(([key, value]) => {
            s3FormData.append(key, value as string)
          })
        }

        s3FormData.append("file", file)

        const s3Response = await fetch(data.uploadUrl, {
          method: "POST",
          body: s3FormData,
        })

        if (!s3Response.ok) {
          throw new Error(`Ошибка загрузки файла ${file.name} в облачное хранилище`)
        }

        return data.fileId
      }

      return Promise.all(images.map((img) => uploadSingleImage(img)))
    },
  })
}

export const useCreatePost = () => {
  return useMutation({
    mutationFn: async (payload: CreatePostPayload) => {
      const token = getAccessToken()

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Ошибка при создании поста")
      }

      return response.json()
    },
  })
}
