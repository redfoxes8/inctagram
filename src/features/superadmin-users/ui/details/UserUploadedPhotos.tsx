"use client"

import { useState } from "react"
import Image from "next/image"
import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { Button } from "@/shared/ui/Button"
import { Icon } from "@/shared/ui/Icon"
import { Pagination } from "@/shared/ui/Pagination"
import { useSuperadminUserPhotos } from "@/features/superadmin-users/api/user-photos-api"
import { getUsersErrorMessage } from "@/features/superadmin-users/api/users-api"
import { getProfileHref } from "@/features/superadmin-users/model/types"
import type { PageInput } from "@/features/superadmin-users/model/user-details.types"
import s from "./UserDetails.module.css"

type Props = {
  userId: string
  input: PageInput
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function UserUploadedPhotos({ userId, input, onPageChange, onPageSizeChange }: Props) {
  const { data, error, loading, refetch } = useSuperadminUserPhotos(userId, input)
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set())
  const gallery = !loading && !error ? data?.superadminUser?.uploadedPhotos : undefined
  const upstreamUnavailable =
    CombinedGraphQLErrors.is(error) && error.errors.some((item) => item.extensions?.code === "UPSTREAM_UNAVAILABLE")
  const message = error
    ? upstreamUnavailable
      ? "Unable to load photos. Please try again."
      : getUsersErrorMessage(error)
    : data?.superadminUser === null
      ? "User not found or deleted."
      : "Unable to load photos. Please try again."

  const refresh = () => {
    if (input.page !== 1) onPageChange(1)
    else void refetch().catch(() => {})
  }

  if (loading)
    return (
      <p className={s.state} role="status">
        Loading photos…
      </p>
    )
  if (error || !gallery)
    return (
      <div className={s.state}>
        <p role="alert">{message}</p>
        <Button variant="outlined" onClick={refresh}>
          Retry
        </Button>
      </div>
    )

  return (
    <section aria-label="Uploaded photos">
      {gallery.items.length === 0 ? (
        <div className={s.state} role="status">
          <p>{gallery.totalCount === 0 ? "No photos yet." : "This page is empty."}</p>
          {input.page > 1 && (
            <Button variant="outlined" onClick={() => onPageChange(1)}>
              Back to first page
            </Button>
          )}
        </div>
      ) : (
        <ul className={s.gallery}>
          {gallery.items.map((photo, index) => {
            const href = getProfileHref(photo.url)
            const failureKey = `${photo.imageId}:${photo.url ?? ""}`
            return (
              <li key={photo.imageId} className={s.photo} data-post-id={photo.postId}>
                {href && !failedImages.has(failureKey) ? (
                  <Image
                    src={href}
                    alt={`Uploaded photo ${index + 1}`}
                    fill
                    unoptimized
                    sizes="(max-width: 600px) 100vw, (max-width: 1023px) 50vw, 25vw"
                    className={s.photoImage}
                    onError={() => setFailedImages((previous) => new Set(previous).add(failureKey))}
                  />
                ) : (
                  <div className={s.photoFallback} role="img" aria-label="Image unavailable">
                    <Icon name="image-outline" />
                    <span>Image unavailable</span>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
      <Pagination
        currentPage={gallery.pageInfo.page}
        pagesCount={Math.min(10000, gallery.pageInfo.pagesCount)}
        pageSize={input.pageSize}
        pageSizeOptions={[4, 8, 10]}
        showWhenEmpty
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </section>
  )
}
