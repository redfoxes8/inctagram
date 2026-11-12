"use client"

import { useRef, useState, type FormEvent } from "react"
import { Pagination } from "@/shared/ui/Pagination"
import { getUsersErrorMessage, useSuperadminUsers } from "@/features/superadmin-users/api/users-api"
import { useDeleteSuperadminUser } from "@/features/superadmin-users/api/delete-user-api"
import { useBanSuperadminUser } from "@/features/superadmin-users/api/ban-user-api"
import type { BanReasonInput } from "@/features/superadmin-users/model/ban-user.types"
import {
  DEFAULT_USERS_PAGE_SIZE,
  type SuperadminUser,
  type UsersInput,
  type UsersSort,
} from "@/features/superadmin-users/model/types"
import { UsersToolbar } from "@/features/superadmin-users/ui/UsersToolbar"
import { UsersTable } from "@/features/superadmin-users/ui/UsersTable"
import { DeleteUserDialog } from "@/features/superadmin-users/ui/DeleteUserDialog"
import { BanUserDialog } from "@/features/superadmin-users/ui/BanUserDialog"
import s from "./SuperadminUsers.module.css"

const initialInput: UsersInput = {
  page: 1,
  pageSize: DEFAULT_USERS_PAGE_SIZE,
  searchUsername: "",
  sort: "CREATED_AT_DESC",
  banFilter: "ALL",
}

export function SuperadminUsers() {
  const [input, setInput] = useState(initialInput)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<SuperadminUser | null>(null)
  const [deletePending, setDeletePending] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [refreshError, setRefreshError] = useState("")
  const [banTarget, setBanTarget] = useState<SuperadminUser | null>(null)
  const [banPending, setBanPending] = useState(false)
  const [banError, setBanError] = useState("")
  const actionInFlight = useRef(false)
  const deleteUser = useDeleteSuperadminUser()
  const banUser = useBanSuperadminUser()
  const { data, error, loading, refetch } = useSuperadminUsers(input)
  // Ни в коем случае не отображайте неполные или устаревшие данные в виде списка успешных результатов после ошибки GraphQL.
  const page = !loading && !error ? data?.superadminUsers : undefined
  const disabled = loading || deletePending || banPending

  const updateInput = (patch: Partial<UsersInput>) => {
    if (actionInFlight.current) return
    setRefreshError("")
    setInput((previous) => ({ ...previous, ...patch, page: patch.page ?? 1 }))
  }
  const refresh = async () => {
    const response = await refetch()
    if (response.error) throw response.error
    const list = response.data?.superadminUsers
    if (!list) throw new Error("Users list not confirmed")
    const lastPage = Math.max(1, Math.min(10000, list.pageInfo.pagesCount))
    if (input.page > lastPage) setInput((previous) => ({ ...previous, page: lastPage }))
  }
  const openDelete = (user: SuperadminUser) => {
    if (actionInFlight.current) return
    setBanTarget(null)
    setDeleteError("")
    setRefreshError("")
    setDeleteTarget(user)
  }
  const closeDelete = () => {
    if (actionInFlight.current) return
    setDeleteTarget(null)
    setDeleteError("")
  }
  const openBan = (user: SuperadminUser) => {
    if (actionInFlight.current || user.state === "BLOCKED") return
    setDeleteTarget(null)
    setBanError("")
    setRefreshError("")
    setBanTarget(user)
  }
  const closeBan = () => {
    if (actionInFlight.current) return
    setBanTarget(null)
    setBanError("")
  }
  const confirmBan = async (reason: BanReasonInput) => {
    if (!banTarget || actionInFlight.current) return
    actionInFlight.current = true
    setBanPending(true)
    setBanError("")
    try {
      const result = await banUser(banTarget.userId, reason)
      if (result.outcome === "NOT_FOUND" || result.outcome === "USER_DELETED") {
        setBanError(result.outcome === "NOT_FOUND" ? "User not found." : "This user has been deleted.")
        try {
          await refresh()
        } catch {
          setBanError("User unavailable. The users list could not be refreshed.")
        }
        return
      }
      setBanTarget(null)
      try {
        await refresh()
      } catch {
        setRefreshError("The users list could not be refreshed. Please try again.")
      }
    } catch (failure) {
      setBanError(`Unable to ban user. ${getUsersErrorMessage(failure)}`)
    } finally {
      actionInFlight.current = false
      setBanPending(false)
    }
  }
  const confirmDelete = async () => {
    if (!deleteTarget || actionInFlight.current) return
    actionInFlight.current = true
    setDeletePending(true)
    setDeleteError("")
    try {
      const result = await deleteUser(deleteTarget.userId)
      if (result.outcome === "NOT_FOUND") {
        setDeleteError("User not found. The users list will be refreshed.")
        try {
          await refresh()
        } catch {
          setDeleteError("User not found. The users list could not be refreshed. Please try again.")
        }
        return
      }
      setDeleteTarget(null)
      try {
        await refresh()
      } catch {
        setRefreshError("The users list could not be refreshed. Please try again.")
      }
    } catch (deleteFailure) {
      setDeleteError(`Unable to delete user. ${getUsersErrorMessage(deleteFailure)}`)
    } finally {
      actionInFlight.current = false
      setDeletePending(false)
    }
  }
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateInput({ searchUsername: search.trim() })
  }
  const toggleSort = (column: "username" | "createdAt") => {
    const sort: UsersSort =
      column === "username"
        ? input.sort === "USERNAME_ASC"
          ? "USERNAME_DESC"
          : "USERNAME_ASC"
        : input.sort === "CREATED_AT_DESC"
          ? "CREATED_AT_ASC"
          : "CREATED_AT_DESC"
    updateInput({ sort })
  }

  return (
    <main className={s.main}>
      <h1 className={s.srOnly}>Users list</h1>
      <UsersToolbar
        search={search}
        banFilter={input.banFilter}
        disabled={disabled}
        onSearchChange={setSearch}
        onSearchSubmit={submitSearch}
        onSearchClick={() => updateInput({ searchUsername: search.trim() })}
        onBanFilterChange={(value) => updateInput({ banFilter: value })}
      />
      <UsersTable
        page={page}
        currentPage={input.page}
        pageSize={input.pageSize}
        sort={input.sort}
        loading={loading}
        disabled={disabled}
        errorMessage={error || !page ? getUsersErrorMessage(error) : undefined}
        onSort={toggleSort}
        onDelete={openDelete}
        onBan={openBan}
        onRetry={() => {
          void refresh().catch(() => {})
        }}
        onPreviousPage={() => {
          if (page) updateInput({ page: Math.max(1, Math.min(input.page - 1, page.pageInfo.pagesCount)) })
        }}
      />
      {refreshError && (
        <p className={s.refreshError} role="alert">
          {refreshError}
        </p>
      )}
      {page && (
        <Pagination
          currentPage={page.pageInfo.page}
          pagesCount={Math.min(10000, page.pageInfo.pagesCount)}
          pageSize={input.pageSize}
          pageSizeOptions={[4, 8, 10]}
          disabled={disabled}
          onPageChange={(number) => updateInput({ page: number })}
          onPageSizeChange={(pageSize) => updateInput({ pageSize })}
        />
      )}
      <DeleteUserDialog
        user={deleteTarget}
        pending={deletePending}
        error={deleteError}
        onClose={closeDelete}
        onConfirm={() => {
          void confirmDelete()
        }}
      />
      {banTarget && (
        <BanUserDialog
          key={banTarget.userId}
          user={banTarget}
          pending={banPending}
          error={banError}
          onClose={closeBan}
          onConfirm={(reason) => {
            void confirmBan(reason)
          }}
        />
      )}
    </main>
  )
}
