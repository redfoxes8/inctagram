"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"

interface UseInfiniteScrollProps {
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  rootMargin?: string
  threshold?: number
}

export const useInfiniteScroll = ({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  rootMargin = "0px 0px 30px 0px",
  threshold = 0.1,
}: UseInfiniteScrollProps) => {
  const { ref, inView } = useInView({
    rootMargin,
    threshold,
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  return { ref, inView }
}
