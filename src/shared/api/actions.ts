"use server"

import { revalidatePath } from "next/cache"

export async function revalidateProfile(userId: string) {
  revalidatePath(`/profile/${userId}`)
  revalidatePath("/")
}

export async function revalidateFeed() {
  revalidatePath("/")
}

export async function revalidatePost(postId: string) {
  revalidatePath(`/api/v1/posts/${postId}`)
}

export async function revalidateAllPosts(userId?: string) {
  revalidatePath("/")
  if (userId) {
    revalidatePath(`/profile/${userId}`)
  }
}

