import { gql, type TypedDocumentNode } from "@apollo/client"
import type { PostsEvent, PostsInput, PostsPage } from "@/features/superadmin-posts/model/types"

export const POSTS_QUERY: TypedDocumentNode<{ superadminPosts: PostsPage | null }, { input: PostsInput }> = gql`
  query SuperadminPostsPage($input: SuperadminPostsInput!) {
    superadminPosts(input: $input) {
      items {
        postId
        userId
        username
        description
        publishedAt
        images {
          fileId
          url
          order
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`
export const POSTS_SUBSCRIPTION: TypedDocumentNode<
  { superadminPostPublished: PostsEvent },
  { input: { searchUsername: string } }
> = gql`
  subscription SuperadminPostsLive($input: SuperadminPostPublishedInput!) {
    superadminPostPublished(input: $input) {
      kind
      post {
        postId
        userId
        username
        description
        publishedAt
        images {
          fileId
          url
          order
        }
      }
    }
  }
`
