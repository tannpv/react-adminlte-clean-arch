import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'
import { fetchUsers, createUser, updateUser, deleteUser } from '../api/usersApi'

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
  const qc = useQueryClient()

  React.useEffect(() => {
    toastr.options = {
      positionClass: 'toast-top-right',
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
      newestOnTop: true,
    }
  }, [])

  const searchValue = search?.trim() || ''

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['users', { search: searchValue }],
    queryFn: () => fetchUsers({ search: searchValue }),
    keepPreviousData: true,
  })

  const createUserMutation = useMutation({
    mutationFn: (payload) => createUser(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['users'] })
      toastr.success('User created successfully')
    },
    onError: (e) => {
      const status = e?.response?.status
      if (status !== 400) toastr.error(e?.message || 'Failed to create user')
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['users'] })
      toastr.success('User updated successfully')
    },
    onError: (e) => {
      const status = e?.response?.status
      if (status !== 400) toastr.error(e?.message || 'Failed to update user')
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['users'] })
      toastr.success('User deleted successfully')
    },
    onError: (e) => toastr.error(e?.message || 'Failed to delete user'),
  })

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
