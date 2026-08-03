"use client"

import { useMeQuery } from "@/features/auth/api/use-me"
import { SidebarWidget } from "@/widgets/sidebar-widget"
import { CreatePostWizard } from "@/features/create-post/ui/post-wizard/CreatePostWizard"
import clsx from "clsx"
import styles from "./layout.module.css"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useMeQuery()

  return (
    <>
      <div className={styles.userShell}>
        <SidebarWidget />

        <main className={clsx(styles.userMain, !user && styles.userMain_guest)}>
          <div className={clsx(styles.contentContainer, !user && styles.contentContainer_guest)}>{children}</div>
        </main>
      </div>

      <CreatePostWizard />
    </>
  )
}
