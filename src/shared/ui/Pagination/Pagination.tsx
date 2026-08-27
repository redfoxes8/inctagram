"use client"

import { Icon } from "@/shared/ui/Icon"
import { SelectBox } from "@/shared/ui/SelectBox"

import s from "./Pagination.module.css"

type PageItem = number | "..."

export type PaginationProps = {
  currentPage: number
  pagesCount: number
  pageSize: number
  disabled?: boolean
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

const getPageNumbers = (currentPage: number, totalPages: number): PageItem[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages]
  }

  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
}

export const Pagination = ({
  currentPage,
  pagesCount,
  pageSize,
  disabled = false,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) => {
  if (pagesCount <= 0) {
    return null
  }

  const pageNumbers = getPageNumbers(currentPage, pagesCount)
  const options = pageSizeOptions.map((option) => ({
    value: String(option),
    label: String(option),
  }))

  return (
    <div className={s.pagination} aria-label="Pagination">
      <button
        type="button"
        className={s.arrow}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || disabled}
        aria-label="Previous page"
      >
        <Icon name="arrow-ios-back" width={16} height={16} />
      </button>

      <div className={s.pages}>
        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className={s.ellipsis}>
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              className={s.page}
              data-active={page === currentPage}
              onClick={() => onPageChange(page)}
              disabled={disabled}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        className={s.arrow}
        onClick={() => onPageChange(Math.min(pagesCount, currentPage + 1))}
        disabled={currentPage === pagesCount || disabled}
        aria-label="Next page"
      >
        <Icon name="arrow-ios-forward" width={16} height={16} />
      </button>

      <div className={s.size}>
        <span>Show</span>
        <SelectBox
          value={String(pageSize)}
          options={options}
          onChange={(value) => onPageSizeChange(Number(value))}
          width="52px"
          height="24px"
          className={s.pageSizeSelect}
          triggerClassName={s.pageSizeTrigger}
          iconClassName={s.pageSizeIcon}
        />
        <span>on page</span>
      </div>
    </div>
  )
}
