"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/shared/ui/Button"
import { Input } from "@/shared/ui/Input"
import { Icon } from "@/shared/ui/Icon"
import { Pagination } from "@/shared/ui/Pagination"
import { getPaymentsErrorMessage, useSuperadminPayments } from "@/features/superadmin-payments/api/payments-api"
import {
  nextPaymentsSort,
  PAYMENTS_PAGE_SIZE,
  type PaymentsInput,
  type PaymentsSortKey,
} from "@/features/superadmin-payments/model/types"
import { PaymentsTable } from "@/features/superadmin-payments/ui/PaymentsTable"
import s from "./SuperadminPayments.module.css"

const initialInput: PaymentsInput = { page: 1, searchUsername: "", sort: "CREATED_AT_DESC" }

export function SuperadminPayments() {
  const [input, setInput] = useState(initialInput)
  const [search, setSearch] = useState("")
  const { data, error, loading, refetch } = useSuperadminPayments(input)
  const page = !loading && !error ? (data?.superadminPayments ?? undefined) : undefined
  const searchPayments = () => {
    if (!loading) setInput((previous) => ({ ...previous, page: 1, searchUsername: search.trim() }))
  }
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    searchPayments()
  }
  const changePage = (number: number) => {
    if (!loading) setInput((previous) => ({ ...previous, page: number }))
  }
  const sortPayments = (key: PaymentsSortKey) => {
    if (!loading) setInput((previous) => ({ ...previous, page: 1, sort: nextPaymentsSort(previous.sort, key) }))
  }
  const refresh = async () => {
    const result = await refetch()
    if (result.error || !result.data?.superadminPayments) return
    const lastPage = Math.max(1, Math.min(10000, result.data.superadminPayments.pageInfo.pagesCount))
    if (input.page > lastPage) setInput((previous) => ({ ...previous, page: lastPage }))
  }
  return (
    <main className={s.main}>
      <h1 className={s.srOnly}>Payments list</h1>
      <form className={s.search} role="search" onSubmit={submitSearch}>
        <Input
          aria-label="Search payments by username"
          placeholder="Search"
          value={search}
          maxLength={100}
          disabled={loading}
          leftIcon={<Icon name="search-outline" />}
          onLeftIconClick={searchPayments}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Button type="submit" variant="outlined" className={s.searchSubmit} disabled={loading}>
          Search
        </Button>
      </form>
      <PaymentsTable
        page={page}
        sort={input.sort}
        loading={loading}
        errorMessage={!loading && !page ? getPaymentsErrorMessage(error) : undefined}
        onSort={sortPayments}
        onRetry={() => {
          void refresh().catch(() => {})
        }}
        onPreviousPage={() => changePage(Math.max(1, Math.min(input.page - 1, page?.pageInfo.pagesCount ?? 1)))}
      />
      {page && (
        <Pagination
          currentPage={page.pageInfo.page}
          pagesCount={Math.min(10000, page.pageInfo.pagesCount)}
          pageSize={PAYMENTS_PAGE_SIZE}
          fixedPageSize
          showWhenEmpty
          disabled={loading}
          onPageChange={changePage}
          onPageSizeChange={() => {}}
        />
      )}
    </main>
  )
}
