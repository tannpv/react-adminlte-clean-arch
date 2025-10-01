import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { ApiClient } from '../lib/apiClient'

export function usePermissions() {
  const { data, isLoading: loading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const res = await ApiClient.get('/me')
        return res.data
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        // Set default permissions for development
        return { permissions: ['users.manage', 'roles.manage'] }
      }
    },
    staleTime: 10_000, // 10 seconds
    retry: 1,
  })

  const perms = useMemo(() => new Set(data?.permissions || []), [data])
  const can = (p) => perms.has(p)
  return { can, permissions: perms, me: data, loading }
}
