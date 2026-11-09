"use client"

import type { FormEvent } from "react"
import { Button } from "@/shared/ui/Button"
import { Input } from "@/shared/ui/Input"
import { SelectBox } from "@/shared/ui/SelectBox"
import { Icon } from "@/shared/ui/Icon"
import type { BanFilter } from "@/features/superadmin-users/model/types"
import s from "@/features/superadmin-users/ui/SuperadminUsers.module.css"

type UsersToolbarProps = {
  search: string
  banFilter: BanFilter
  disabled: boolean
  onSearchChange: (value: string) => void
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void
  onSearchClick: () => void
  onBanFilterChange: (value: BanFilter) => void
}

export function UsersToolbar({
  search,
  banFilter,
  disabled,
  onSearchChange,
  onSearchSubmit,
  onSearchClick,
  onBanFilterChange,
}: UsersToolbarProps) {
  return (
    <div className={s.toolbar}>
      <form className={s.search} onSubmit={onSearchSubmit} role="search">
        <Input
          aria-label="Search users by username"
          placeholder="Search"
          value={search}
          maxLength={100}
          onChange={(event) => onSearchChange(event.target.value)}
          className={s.searchInput}
          leftIcon={<Icon name="search-outline" />}
          onLeftIconClick={onSearchClick}
        />
        <Button type="submit" variant="outlined" disabled={disabled}>
          Search
        </Button>
      </form>
      <SelectBox
        placeholder="Filter users by block status"
        width="234px"
        height="36px"
        value={banFilter}
        options={[
          { value: "ALL", label: "Not selected" },
          { value: "BLOCKED", label: "Blocked" },
          { value: "NOT_BLOCKED", label: "Not Blocked" },
        ]}
        onChange={(value) => onBanFilterChange(value as BanFilter)}
      />
    </div>
  )
}
