import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity, //5000,
      //gcTime: 10000 // если нет подписчиков - удалить всё нафик...
    },
  },
})
