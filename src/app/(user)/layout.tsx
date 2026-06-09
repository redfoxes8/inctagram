"use client"

import { CreatePostWizard } from "@/features/create-post/ui/post-wizard/CreatePostWizard"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CreatePostWizard />
    </>
  )
}
