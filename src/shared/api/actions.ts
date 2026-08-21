"use server"

import { revalidatePath } from "next/cache"

export async function revalidateProfile(userId: string) {
  revalidatePath(`/profile/${userId}`)
  revalidatePath("/")
}

export async function revalidateFeed() {
  revalidatePath("/")
}

export async function revalidateAllPosts(userId?: string) {
  revalidatePath("/")
  if (userId) {
    revalidatePath(`/profile/${userId}`)
  }
}
