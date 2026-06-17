import { useMutation } from "@tanstack/react-query"
import { client } from "@/shared/api/client"
import { paths } from "@/shared/api/schema"

export const useUploadPostImages = () => {
  return useMutation({
    mutationFn: async (images: File[]): Promise<string[]> => {
      const uploadSingleImage = async (file: File): Promise<string> => {
        const ext = file.name.split(".").pop()?.toLowerCase()
        const normalizedExt = ext === "jpg" ? "jpeg" : ext

        type AllowedExtension =
          paths["/api/v1/posts/images/upload-url"]["post"]["requestBody"]["content"]["application/json"]["fileExtension"]
        const fileExtension = `.${normalizedExt}` as AllowedExtension

        const { data, error } = await client.POST("/api/v1/posts/images/upload-url", {
          body: {
            fileExtension: fileExtension,
            fileSize: file.size,
          },
        })

        if (error || !data || !data.uploadUrl || !data.fileId) {
          throw new Error(`Бэкенд не отдал ссылку для: ${file.name}`)
        }

        const s3FormData = new FormData()
        if (data.uploadFields) {
          Object.entries(data.uploadFields).forEach(([key, value]) => {
            if (key !== "file") s3FormData.append(key, value as string)
          })
        }
        s3FormData.append("file", file)

        const s3Response = await fetch(data.uploadUrl, {
          method: "POST",
          body: s3FormData,
          mode: "cors",
        })

        if (!s3Response.ok) {
          const errTxt = await s3Response.text().catch(() => "")
          throw new Error(`AWS S3 вернул ошибку ${s3Response.status}. Файл НЕ загружен!`)
        }

        await new Promise((resolve) => setTimeout(resolve, 1500))

        return data.fileId
      }

      return Promise.all(images.map((img) => uploadSingleImage(img)))
    },
  })
}

export const useCreatePost = () => {
  return useMutation({
    mutationFn: async (payload: { description: string; fileIds: string[] }) => {
      const { data, error } = await client.POST("/api/v1/posts", {
        body: payload,
      })

      if (error) {
        throw new Error("Ошибка при создании поста на бэкенде")
      }

      return data
    },
  })
}
