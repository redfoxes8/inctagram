"use client"

import { AuthProvider } from "@/features/auth/lib/auth-provider"
import { CreatePostWizard } from "@/features/create-post/ui/post-wizard/CreatePostWizard"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthProvider>{children}</AuthProvider>
      <CreatePostWizard />
    </>
  )
}
