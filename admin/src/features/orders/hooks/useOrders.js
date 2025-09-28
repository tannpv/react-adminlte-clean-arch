import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ApiClient } from '../../../shared/lib/ApiClient'

// API endpoints
const ORDERS_ENDPOINT = '/orders'

// Fetch all orders
export const fetchOrders = async (params = {}) => {
  const response = await ApiClient.get(ORDERS_ENDPOINT, { params })
  return response.data
}

// Fetch single order
export const fetchOrder = async (id) => {
  const response = await ApiClient.get(`${ORDERS_ENDPOINT}/${id}`)
  return response.data
}

// Update order status
export const updateOrderStatus = async ({ id, status, reason }) => {
  const response = await ApiClient.patch(`${ORDERS_ENDPOINT}/${id}/status`, {
    status,
    reason
  })
  return response.data
}

// Main hook for orders management
export const useOrders = ({ enabled = true, search = '' } = {}) => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState(search)

  // Fetch orders query
  const {
    data: ordersData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['orders', searchTerm],
    queryFn: () => fetchOrders({ search: searchTerm }),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes (orders change frequently)
  })

  const orders = ordersData?.data || []

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  // Handler functions
  const handleUpdateOrderStatus = async (id, status, reason = '') => {
    try {
      const result = await updateOrderStatusMutation.mutateAsync({ id, status, reason })
      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update order status'
      }
    }
  }

  return {
    orders,
    isLoading,
    isError,
    error,
    searchTerm,
    setSearchTerm,
    updateOrderStatusMutation,
    handleUpdateOrderStatus,
    refetch
  }
}

// Hook for single order
export const useOrder = (id, { enabled = true } = {}) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
  })
}

// Hook for order search
export const useOrderSearch = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm
  }
}
