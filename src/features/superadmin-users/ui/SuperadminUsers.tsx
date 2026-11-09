"use client"

import { useState, type FormEvent } from "react"
import { Pagination } from "@/shared/ui/Pagination"
import { getUsersErrorMessage, useSuperadminUsers } from "@/features/superadmin-users/api/users-api"
import { DEFAULT_USERS_PAGE_SIZE, type UsersInput, type UsersSort } from "@/features/superadmin-users/model/types"
import { UsersToolbar } from "@/features/superadmin-users/ui/UsersToolbar"
import { UsersTable } from "@/features/superadmin-users/ui/UsersTable"
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
  const { data, error, loading, refetch } = useSuperadminUsers(input)
  // Ни в коем случае не отображайте неполные или устаревшие данные в виде списка успешных результатов после ошибки GraphQL.
  const page = !loading && !error ? data?.superadminUsers : undefined

  const updateInput = (patch: Partial<UsersInput>) => {
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
        disabled={loading}
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
        disabled={loading}
        errorMessage={error || !page ? getUsersErrorMessage(error) : undefined}
        onSort={toggleSort}
        onRetry={() => {
          void refresh().catch(() => {})
        }}
        onPreviousPage={() => {
          if (page) updateInput({ page: Math.max(1, Math.min(input.page - 1, page.pageInfo.pagesCount)) })
        }}
      />
      {page && (
        <Pagination
          currentPage={page.pageInfo.page}
          pagesCount={Math.min(10000, page.pageInfo.pagesCount)}
          pageSize={input.pageSize}
          pageSizeOptions={[4, 8, 10]}
          disabled={loading}
          onPageChange={(number) => updateInput({ page: number })}
          onPageSizeChange={(pageSize) => updateInput({ pageSize })}
        />
      )}
    </main>
  )
}
