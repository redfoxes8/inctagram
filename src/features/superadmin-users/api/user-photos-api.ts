"use client"

import { gql, type TypedDocumentNode } from "@apollo/client"
import { useQuery } from "@apollo/client/react"
import type { PageInput, UploadedPhotosData } from "@/features/superadmin-users/model/user-details.types"

const USER_UPLOADED_PHOTOS: TypedDocumentNode<UploadedPhotosData, { userId: string; input: PageInput }> = gql`
  query SuperadminUserUploadedPhotos($userId: ID!, $input: PageInput!) {
    superadminUser(userId: $userId) {
      userId
      uploadedPhotos(input: $input) {
        items {
          imageId
          postId
          url
        }
        totalCount
        pageInfo {
          page
          pageSize
          pagesCount
          hasNextPage
        }
      }
    }
  }
`

export function useSuperadminUserPhotos(userId: string, input: PageInput) {
  return useQuery(USER_UPLOADED_PHOTOS, {
    variables: { userId, input },
    ssr: false,
    fetchPolicy: "no-cache",
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  })
}
