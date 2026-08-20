import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/shared/api/client"
import { getProfileSettingsQueryKey } from "@/features/profile-settings/api/profile-settings-api"
import type {
  GetAvatarUploadUrlRequest,
  GetAvatarUploadUrlResponse,
  ConfirmAvatarRequest,
  AllowedAvatarExtension,
} from "../model/avatar.type"

export const AVATAR_QUERY_KEY = ["profile", "avatar"]

export function useUploadAvatarMutation(userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase()
      const normalizedExt = ext === "jpg" ? "jpeg" : ext
      const fileExtension = normalizedExt as AllowedAvatarExtension

      const { data: urlData, error: urlError } = await client.POST("/api/v1/profile/avatar/upload-url", {
        body: {
          fileSize: file.size,
          fileExtension,
        } satisfies GetAvatarUploadUrlRequest,
      })

      if (urlError || !urlData) {
        throw new Error((urlError as any)?.message || "Не удалось получить URL для загрузки")
      }

      const formData = new FormData()
      const uploadFields = (urlData as GetAvatarUploadUrlResponse).uploadFields

      const backendContentTypeField = uploadFields?.find((f) => f.name.toLowerCase() === "content-type")
      let finalContentType = backendContentTypeField?.value || file.type
      if (finalContentType === "image/jpg") {
        finalContentType = "image/jpeg"
      }

      if (uploadFields && Array.isArray(uploadFields)) {
        const keyField = uploadFields.find((f) => f.name.toLowerCase() === "key")
        if (keyField) {
          const finalKeyValue = keyField.value.includes("${filename}")
            ? keyField.value.replace("${filename}", file.name)
            : keyField.value
          formData.append(keyField.name, finalKeyValue)
        }
      }

      if (uploadFields && Array.isArray(uploadFields)) {
        uploadFields.forEach((field: { name: string; value: string }) => {
          const nameLower = field.name.toLowerCase()
          if (nameLower !== "key" && nameLower !== "file" && nameLower !== "content-type") {
            formData.append(field.name, field.value)
          }
        })
      }

      formData.append("Content-Type", finalContentType)
      formData.append("file", file)

      const uploadResponse = await fetch(urlData.uploadUrl, {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Ошибка при загрузке файла в облако")
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const { data: confirmData, error: confirmError } = await client.PUT("/api/v1/profile/avatar/confirm", {
        body: {
          fileId: urlData.fileId,
        } satisfies ConfirmAvatarRequest,
      })

      if (confirmError) {
        throw new Error((confirmError as any)?.message || "Не удалось подтвердить загрузку аватара")
      }

      return confirmData
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: getProfileSettingsQueryKey(userId),
          refetchType: "all",
        })
        queryClient.invalidateQueries({ queryKey: ["me"] })

        queryClient.invalidateQueries({ queryKey: ["posts", { userId }], refetchType: "all" })
      }
    },
  })
}

export function useDeleteAvatarMutation(userId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await client.DELETE("/api/v1/profile/avatar")
      if (error) {
        console.log("Delete avatar error:", error)
        throw error
      }
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: getProfileSettingsQueryKey(userId),
          refetchType: "all",
        })
        queryClient.invalidateQueries({ queryKey: ["me"] })

        queryClient.invalidateQueries({ queryKey: ["posts", { userId }], refetchType: "all" })
      }
    },
  })
}
