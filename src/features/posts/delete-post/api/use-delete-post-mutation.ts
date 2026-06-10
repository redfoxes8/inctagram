import { useMutation, useQueryClient } from "@tanstack/react-query"
import { DeletePostPayload } from "@/features/posts/delete-post/api/delete-post.types"
import { client } from "@/shared/api/client"

export const useDeletePostMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, DeletePostPayload>({
    mutationFn: async ({ postId }: DeletePostPayload) => {
      const { error } = await client.DELETE("/api/v1/posts/{postId}", {
        params: {
          path: { postId },
        },
      })

      if (error) {
        throw new Error("Delete post failed")
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["posts"] })
    },
  })
}
