import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ApiClient } from '../../../shared/lib/ApiClient'

// API endpoints
const STORES_ENDPOINT = '/stores'

// Fetch all stores
export const fetchStores = async (params = {}) => {
  const response = await ApiClient.get(STORES_ENDPOINT, { params })
  return response.data
}

// Fetch single store
export const fetchStore = async (id) => {
  const response = await ApiClient.get(`${STORES_ENDPOINT}/${id}`)
  return response.data
}

// Create store
export const createStore = async (storeData) => {
  const response = await ApiClient.post(STORES_ENDPOINT, storeData)
  return response.data
}

// Update store
export const updateStore = async ({ id, ...storeData }) => {
  const response = await ApiClient.put(`${STORES_ENDPOINT}/${id}`, storeData)
  return response.data
}

// Delete store
export const deleteStore = async (id) => {
  const response = await ApiClient.delete(`${STORES_ENDPOINT}/${id}`)
  return response.data
}

// Approve/reject store
export const updateStoreStatus = async ({ id, status, reason }) => {
  const response = await ApiClient.patch(`${STORES_ENDPOINT}/${id}/status`, {
    status,
    reason
  })
  return response.data
}

// Main hook for stores management
export const useStores = ({ enabled = true, search = '' } = {}) => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState(search)

  // Fetch stores query
  const {
    data: storesData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['stores', searchTerm],
    queryFn: () => fetchStores({ search: searchTerm }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const stores = storesData?.data || []

  // Create store mutation
  const createStoreMutation = useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })

  // Update store mutation
  const updateStoreMutation = useMutation({
    mutationFn: updateStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })

  // Delete store mutation
  const deleteStoreMutation = useMutation({
    mutationFn: deleteStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })

  // Update store status mutation
  const updateStoreStatusMutation = useMutation({
    mutationFn: updateStoreStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    },
  })

  // Handler functions
  const handleCreateStore = async (storeData) => {
    try {
      const result = await createStoreMutation.mutateAsync(storeData)
      return { success: true, data: result }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create store' 
      }
    }
  }

  const handleUpdateStore = async (id, storeData) => {
    try {
      const result = await updateStoreMutation.mutateAsync({ id, ...storeData })
      return { success: true, data: result }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update store' 
      }
    }
  }

  const handleDeleteStore = async (id) => {
    try {
      await deleteStoreMutation.mutateAsync(id)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete store' 
      }
    }
  }

  const handleUpdateStoreStatus = async (id, status, reason = '') => {
    try {
      const result = await updateStoreStatusMutation.mutateAsync({ id, status, reason })
      return { success: true, data: result }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update store status' 
      }
    }
  }

  return {
    stores,
    isLoading,
    isError,
    error,
    searchTerm,
    setSearchTerm,
    createStoreMutation,
    updateStoreMutation,
    deleteStoreMutation,
    updateStoreStatusMutation,
    handleCreateStore,
    handleUpdateStore,
    handleDeleteStore,
    handleUpdateStoreStatus,
    refetch
  }
}

// Hook for single store
export const useStore = (id, { enabled = true } = {}) => {
  return useQuery({
    queryKey: ['store', id],
    queryFn: () => fetchStore(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook for store search
export const useStoreSearch = () => {
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
