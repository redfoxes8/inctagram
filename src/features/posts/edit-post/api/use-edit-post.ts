import { client } from "@/shared/api/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MutationContext, UpdatePostPayload, UpdatePostResponse } from "../model/edit-post.types"
import { SchemaGetFeedResponseDto } from "@/shared/api/schema"

type Args = {
  postId: string
  payload: UpdatePostPayload
}

export const useUpdatePostMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<UpdatePostResponse, Error, Args, MutationContext>({
    mutationFn: async ({ postId, payload }: Args): Promise<UpdatePostResponse> => {
      const res = await client.PATCH("/api/v1/posts/{postId}", {
        params: {
          path: { postId },
        },
        body: payload,
      })

      if (res.error) {
        throw res.error
      }

      return res.data as UpdatePostResponse
    },

    onMutate: async ({ postId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] })
      await queryClient.cancelQueries({ queryKey: ["post", postId] })

      const previousFeed = queryClient.getQueryData<SchemaGetFeedResponseDto>(["feed"])
      const previousPost = queryClient.getQueryData<UpdatePostResponse>(["post", postId])

      queryClient.setQueryData<SchemaGetFeedResponseDto | undefined>(["feed"], (feed) => {
        if (!feed) return feed

        return {
          ...feed,
          posts: feed.posts.map((post) => (post.id === postId ? { ...post, description: payload.description } : post)),
        }
      })

      queryClient.setQueryData<UpdatePostResponse | undefined>(["post", postId], (currentPost) => {
        if (!currentPost) return currentPost

        return {
          ...currentPost,
          post: {
            ...currentPost.post,
            description: payload.description,
          },
        }
      })

      return { previousFeed, previousPost }
    },

    onError: (_error, { postId }, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(["feed"], context.previousFeed)
      }
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost)
      }
    },

    onSettled: (_data, _error, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["feed"] })
      queryClient.invalidateQueries({ queryKey: ["post", postId] })
    },
  })
}
