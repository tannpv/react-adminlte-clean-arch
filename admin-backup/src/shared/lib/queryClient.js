import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})
