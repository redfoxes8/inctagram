import { QueryClient, QueryCache } from "@tanstack/react-query"
import { localStorageKeys } from "@/features/auth/types"

type ApiError = Error & { status?: number }

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      //gcTime: 10000 // если нет подписчиков - удалить всё нафик...
      staleTime: 5 * 60 * 1000,
      retry: false, // в useMeQuery не отрабатывает
    },
  },
  queryCache: new QueryCache({
    onError: (error: ApiError, query) => {
      const queryKey = query.queryKey

      // Обработка ошибки /me — чистим сессию
      if (queryKey[0] === "me" && error?.status === 401) {
        localStorage.removeItem(localStorageKeys.accessToken)
        // queryClient.removeQueries({ queryKey: ["me"] })
      }

      // Сюда можно добавлять другие кейсы
      // if (queryKey[0] === "profile") { ... }
      // if (queryKey[0] === "feed") { ... }
    },
  }),
})
