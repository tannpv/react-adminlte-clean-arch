import { useQuery } from '@tanstack/react-query'
import { fetchProductAttributes } from '../api/productAttributesApi'

export function useProductAttributes({ enabled = true, staleTime = 5 * 60 * 1000 } = {}) {
  const query = useQuery({
    queryKey: ['product-attributes'],
    queryFn: fetchProductAttributes,
    enabled,
    staleTime,
  })

  return {
    attributes: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
