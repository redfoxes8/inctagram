import { useMemo } from 'react'
import { PostItem } from '@/entities/post/model/post.types'
import { SchemaUserMeResponseDto } from '@/shared/api/schema'

export const usePostAuthor = (post: PostItem, currentUser?: SchemaUserMeResponseDto | null) => {
  const authorName = useMemo(() => {
    if (post.owner?.username) {
      return post.owner.username
    }
    if (currentUser && post.ownerId === currentUser.userId) {
      return currentUser.username
    }
    return `User ${post.ownerId?.slice(0, 8) || ''}`
  }, [post, currentUser])

  const authorAvatar = useMemo(() => {
    if (post.owner?.avatarUrl) {
      return post.owner.avatarUrl
    }
    if (currentUser && post.ownerId === currentUser.userId) {
      return currentUser.avatarUrl || undefined
    }
    return undefined
  }, [post, currentUser])

  return { authorName, authorAvatar }
}