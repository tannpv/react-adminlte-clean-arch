import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'
import { createUser, deleteUser, fetchUsers, updateUser } from '../api/usersApi'

const extractValidationErrors = (error) => {
  const status = error?.response?.status
  if (status !== 400) return null
  const fieldErrors = error?.response?.data?.errors || error?.response?.data?.error?.details?.fieldErrors
  if (!fieldErrors || typeof fieldErrors !== 'object') return null
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, value]) => [key, typeof value === 'string' ? value : value?.message || 'Invalid'])
  )
}

export function useUsers({ search } = {}) {
  const queryClient = useQueryClient()

  useEffect(() => {
    toastr.options = {
      positionClass: 'toast-top-right',
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
      newestOnTop: true,
    }
  }, [])

  // Query for users
  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['users', { search: search?.trim() || '' }],
    queryFn: () => fetchUsers({ search: search?.trim() || '' }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toastr.success('User created successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      const validationErrors = extractValidationErrors(error)
      if (!validationErrors) {
        toastr.error(error?.message || 'Failed to create user')
      }
    },
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    onSuccess: () => {
      toastr.success('User updated successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      const validationErrors = extractValidationErrors(error)
      if (!validationErrors) {
        toastr.error(error?.message || 'Failed to update user')
      }
    },
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toastr.success('User deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      toastr.error(error?.message || 'Failed to delete user')
    },
  })

  // Handler functions that throw validation errors for form handling
  const handleCreateUser = async (payload) => {
    try {
      await createUserMutation.mutateAsync(payload)
    } catch (error) {
      const validationErrors = extractValidationErrors(error)
      if (validationErrors) throw validationErrors
      throw error
    }
  }

  const handleUpdateUser = async (id, payload) => {
    try {
      await updateUserMutation.mutateAsync({ id, payload })
    } catch (error) {
      const validationErrors = extractValidationErrors(error)
      if (validationErrors) throw validationErrors
      throw error
    }
  }

  const handleDeleteUser = async (id) => {
    await deleteUserMutation.mutateAsync(id)
  }

  return {
    users,
    isLoading,
    isError,
    error,
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
  }
}
