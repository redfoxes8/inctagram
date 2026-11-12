"use client"

import Link from "next/link"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Button } from "@/shared/ui/Button"
import { Icon } from "@/shared/ui/Icon"
import {
  formatUserDate,
  getProfileHref,
  type SuperadminUser,
  type UsersPage,
  type UsersSort,
} from "@/features/superadmin-users/model/types"
import s from "@/features/superadmin-users/ui/SuperadminUsers.module.css"

type UsersTableProps = {
  page: UsersPage | undefined
  currentPage: number
  pageSize: number
  sort: UsersSort
  loading: boolean
  disabled: boolean
  errorMessage: string | undefined
  onSort: (column: "username" | "createdAt") => void
  onRetry: () => void
  onPreviousPage: () => void
  onDelete: (user: SuperadminUser) => void
  onBan: (user: SuperadminUser) => void
}

export function UsersTable({
  page,
  currentPage,
  pageSize,
  sort,
  loading,
  disabled,
  errorMessage,
  onSort,
  onRetry,
  onPreviousPage,
  onDelete,
  onBan,
}: UsersTableProps) {
  return (
    <div className={s.tableScroll} aria-busy={loading}>
      <table className={s.table}>
        <caption className={s.srOnly}>Users list, {pageSize} users per page</caption>
        <thead>
          <tr>
            <th scope="col">User ID</th>
            <th
              scope="col"
              aria-sort={sort.startsWith("USERNAME") ? (sort === "USERNAME_ASC" ? "ascending" : "descending") : "none"}
            >
              <Button variant="ghost" className={s.sort} onClick={() => onSort("username")} disabled={disabled}>
                Username <span aria-hidden="true">{sort === "USERNAME_ASC" ? "▴" : "▾"}</span>
              </Button>
            </th>
            <th scope="col">Profile link</th>
            <th
              scope="col"
              aria-sort={
                sort.startsWith("CREATED_AT") ? (sort === "CREATED_AT_ASC" ? "ascending" : "descending") : "none"
              }
            >
              <Button variant="ghost" className={s.sort} onClick={() => onSort("createdAt")} disabled={disabled}>
                Date added <span aria-hidden="true">{sort === "CREATED_AT_ASC" ? "▴" : "▾"}</span>
              </Button>
            </th>
            <th scope="col">
              <span className={s.srOnly}>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={5} className={s.state} role="status">
                Loading users…
              </td>
            </tr>
          )}
          {!loading && (errorMessage || !page) && (
            <tr>
              <td colSpan={5} className={s.state}>
                <p role="alert">{errorMessage}</p>
                <Button variant="outlined" onClick={onRetry}>
                  Retry
                </Button>{" "}
                <Link href="/superadmin/sign-in" prefetch={false} className="regular_link">
                  Sign In
                </Link>
              </td>
            </tr>
          )}
          {page && page.items.length === 0 && (
            <tr>
              <td colSpan={5} className={s.state}>
                {page.totalCount > 0 ? "This page is empty." : "No users found."}
                {currentPage > 1 && (
                  <Button variant="outlined" onClick={onPreviousPage}>
                    Previous page
                  </Button>
                )}
              </td>
            </tr>
          )}
          {page?.items.map((user) => {
            const href = getProfileHref(user.profileUrl)
            return (
              <tr key={user.userId}>
                <td>
                  <span className={s.userId}>
                    {user.state === "BLOCKED" ? (
                      <span role="img" aria-label="Blocked">
                        <Icon name="Block" />
                      </span>
                    ) : (
                      <span className={s.statusSpace} />
                    )}
                    <span className={s.userIdValue} title={user.userId}>
                      {user.userId}
                    </span>
                  </span>
                </td>
                <td>{user.username ?? "Unavailable"}</td>
                <td>
                  {href ? (
                    <Link href={href} prefetch={false} className={s.profileLink}>
                      {user.username ?? "View profile"}
                    </Link>
                  ) : (
                    <span className={s.unavailable} title="Backend has not provided a public profile URL">
                      Unavailable
                    </span>
                  )}
                </td>
                <td>
                  <time dateTime={user.createdAt}>{formatUserDate(user.createdAt)}</time>
                </td>
                <td>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className={s.actions}
                        disabled={disabled}
                        aria-label={`Information for ${user.username ?? user.userId}`}
                      >
                        <Icon name="more-horizontal" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content className={s.menu} align="end" sideOffset={4}>
                        <DropdownMenu.Item className={s.menuItem} disabled={disabled} onSelect={() => onDelete(user)}>
                          <Icon name="person-remove-outline" />
                          Delete
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className={s.menuItem}
                          disabled={disabled || user.state === "BLOCKED"}
                          onSelect={() => onBan(user)}
                        >
                          <Icon name="Block" />
                          Ban in the system
                        </DropdownMenu.Item>
                        <DropdownMenu.Item asChild className={s.menuItem}>
                          <Link href={`/superadmin/users/${encodeURIComponent(user.userId)}`} prefetch={false}>
                            <Icon name="more-horizontal" />
                            More information
                          </Link>
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
