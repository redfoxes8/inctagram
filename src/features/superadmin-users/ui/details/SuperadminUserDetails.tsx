"use client"

import { useState } from "react"
import Link from "next/link"
import * as Avatar from "@radix-ui/react-avatar"
import { Tabs } from "@/shared/ui/Tabs"
import { TabPanel } from "@/shared/ui/Tabs/Tabs"
import { Button } from "@/shared/ui/Button"
import { Icon } from "@/shared/ui/Icon"
import { useSuperadminUserDetails, useSuperadminUserTab } from "@/features/superadmin-users/api/user-details-api"
import { getUsersErrorMessage } from "@/features/superadmin-users/api/users-api"
import { DEFAULT_USERS_PAGE_SIZE, formatUserDate, getProfileHref } from "@/features/superadmin-users/model/types"
import type { DetailsTab, PageInput } from "@/features/superadmin-users/model/user-details.types"
import { UserDetailsTab } from "@/features/superadmin-users/ui/details/UserDetailsTab"
import { UserUploadedPhotos } from "@/features/superadmin-users/ui/details/UserUploadedPhotos"
import s from "./UserDetails.module.css"

type DetailsView = "photos" | DetailsTab

const tabItems: { value: DetailsView; label: string }[] = [
  { value: "photos", label: "Uploaded photos" },
  { value: "payments", label: "Payments" },
  { value: "followers", label: "Followers" },
  { value: "following", label: "Following" },
]
const initialPages: Record<DetailsTab, PageInput> = {
  payments: { page: 1, pageSize: DEFAULT_USERS_PAGE_SIZE },
  followers: { page: 1, pageSize: DEFAULT_USERS_PAGE_SIZE },
  following: { page: 1, pageSize: DEFAULT_USERS_PAGE_SIZE },
}

export function SuperadminUserDetails({ userId }: { userId: string }) {
  const [tab, setTab] = useState<DetailsView>("photos")
  const [pages, setPages] = useState(initialPages)
  const [photosInput, setPhotosInput] = useState<PageInput>({ page: 1, pageSize: DEFAULT_USERS_PAGE_SIZE })
  const overview = useSuperadminUserDetails(userId)
  const user = !overview.loading && !overview.error ? overview.data?.superadminUser : undefined
  const dataTab = tab === "photos" ? "payments" : tab
  const result = useSuperadminUserTab(userId, dataTab, pages[dataTab], !!user && tab !== "photos")
  const connection = !result.loading && !result.error ? result.data?.superadminUser?.connection : undefined
  const profileHref = getProfileHref(user?.profileUrl ?? null)
  const avatarHref = getProfileHref(user?.avatarUrl ?? null)

  const updatePage = (patch: Partial<PageInput>) => {
    setPages((previous) => ({ ...previous, [dataTab]: { ...previous[dataTab], ...patch } }))
  }
  const tabError = result.error
    ? getUsersErrorMessage(result.error)
    : result.data?.superadminUser === null
      ? "User not found or deleted."
      : !result.loading && !connection
        ? "Unable to load this tab. Please try again."
        : undefined

  return (
    <main className={s.main}>
      <Link className={s.back} href="/superadmin/users" prefetch={false}>
        <Icon name="arrow-back-outline" />
        Back to Users List
      </Link>
      {overview.loading && (
        <p className={s.state} role="status">
          Loading user…
        </p>
      )}
      {!overview.loading && overview.error && (
        <div className={s.state}>
          <p role="alert">{getUsersErrorMessage(overview.error)}</p>
          <Button
            variant="outlined"
            onClick={() => {
              void overview.refetch().catch(() => {})
            }}
          >
            Retry
          </Button>
          <Link href="/superadmin/sign-in" prefetch={false} className="regular_link">
            Sign In
          </Link>
        </div>
      )}
      {!overview.loading && !overview.error && overview.data?.superadminUser === null && (
        <h1 className="h1">User not found or deleted</h1>
      )}
      {!overview.loading && !overview.error && !overview.data && <p role="alert">Unable to load user information.</p>}
      {user && (
        <>
          <section className={s.overview} aria-label="User information">
            <div className={s.identity}>
              <Avatar.Root className={s.avatar}>
                <Avatar.Image
                  src={avatarHref ?? undefined}
                  alt={`${user.username ?? "User"} avatar`}
                  className={s.avatarImage}
                />
                <Avatar.Fallback className={s.avatarFallback}>
                  <Icon name="person-outline" />
                </Avatar.Fallback>
              </Avatar.Root>
              <div>
                <h1 className="h1">{user.username ?? "Username unavailable"}</h1>
                {profileHref ? (
                  <Link href={profileHref} prefetch={false} className={s.profileLink}>
                    {user.username ?? "View profile"}
                  </Link>
                ) : (
                  <span className={s.muted}>Profile link unavailable</span>
                )}
              </div>
            </div>
            <dl className={s.metadata}>
              <div>
                <dt>User ID</dt>
                <dd>{user.userId}</dd>
              </div>
              <div>
                <dt>Profile Creation Date</dt>
                <dd>
                  <time dateTime={user.createdAt}>{formatUserDate(user.createdAt)}</time>
                </dd>
              </div>
            </dl>
          </section>
          <Tabs items={tabItems} value={tab} onValueChange={(value) => setTab(value as DetailsView)} className={s.tabs}>
            {tabItems.map((item) => (
              <TabPanel key={item.value} value={item.value} className={s.panel}>
                {item.value === tab &&
                  (tab === "photos" ? (
                    <UserUploadedPhotos
                      userId={userId}
                      input={photosInput}
                      onPageChange={(page) => setPhotosInput((previous) => ({ ...previous, page }))}
                      onPageSizeChange={(pageSize) => setPhotosInput({ page: 1, pageSize })}
                    />
                  ) : (
                    <UserDetailsTab
                      tab={tab}
                      connection={connection ?? undefined}
                      input={pages[tab]}
                      loading={result.loading}
                      errorMessage={tabError}
                      onRetry={() => {
                        void result.refetch().catch(() => {})
                      }}
                      onPageChange={(page) => updatePage({ page })}
                      onPageSizeChange={(pageSize) => updatePage({ page: 1, pageSize })}
                    />
                  ))}
              </TabPanel>
            ))}
          </Tabs>
        </>
      )}
    </main>
  )
}
