"use server"

import { revalidatePath } from "next/cache"

export async function revalidateProfile(userId: string) {
  revalidatePath(`/profile/${userId}`)
  revalidatePath("/")
}
