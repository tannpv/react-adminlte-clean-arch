import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ApiClient } from '../lib/apiClient'

export function usePermissions() {
  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await ApiClient.get('/me')
      return res.data
    },
    staleTime: 10_000,
  })
  const perms = useMemo(() => new Set(data?.permissions || []), [data])
  const can = (p) => perms.has(p)
  return { can, permissions: perms, me: data }
}
