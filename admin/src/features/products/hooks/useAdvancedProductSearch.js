import { useQuery } from '@tanstack/react-query'
import { ApiClient } from '../../../shared/lib/apiClient'

const searchProducts = async (searchParams) => {
  const response = await ApiClient.post('/products/search', searchParams)
  return response.data
}

export function useAdvancedProductSearch(searchParams) {
  return useQuery({
    queryKey: ['products', 'advanced-search', searchParams],
    queryFn: () => searchProducts(searchParams),
    enabled: true, // Always enabled, empty search is valid
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  })
}
