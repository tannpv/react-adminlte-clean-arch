import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'
import { createRole, deleteRole, fetchRoles, updateRole } from '../api/rolesApi'

const extractValidationErrors = (error) => {
  const status = error?.response?.status
  if (status !== 400) return null
  const fieldErrors = error?.response?.data?.errors || error?.response?.data?.error?.details?.fieldErrors
  if (!fieldErrors || typeof fieldErrors !== 'object') return null
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, value]) => [key, typeof value === 'string' ? value : value?.message || 'Invalid'])
  )
}

export function useRoles({ enabled = true } = {}) {
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

  const { data: roles = [], isLoading, isError, error } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    enabled,
    staleTime: 5 * 60 * 1000,
  })

  const createRoleMutation = useMutation({
    mutationFn: (payload) => createRole(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['roles'] })
      toastr.success('Role created successfully')
    },
    onError: (e) => {
      const status = e?.response?.status
      if (status !== 400) toastr.error(e?.message || 'Failed to create role')
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, payload }) => updateRole(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['roles'] })
      toastr.success('Role updated successfully')
    },
    onError: (e) => {
      const status = e?.response?.status
      if (status !== 400) toastr.error(e?.message || 'Failed to update role')
    },
  })

  const deleteRoleMutation = useMutation({
    mutationFn: (id) => deleteRole(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['roles'] })
      toastr.success('Role deleted successfully')
    },
    onError: (e) => toastr.error(e?.message || 'Failed to delete role'),
  })

  const handleCreateRole = async (payload) => {
    try {
      await createRoleMutation.mutateAsync(payload)
    } catch (error) {
      const validationErrors = extractValidationErrors(error)
      if (validationErrors) throw validationErrors
      throw error
    }
  }

  const handleUpdateRole = async (id, payload) => {
    try {
      await updateRoleMutation.mutateAsync({ id, payload })
    } catch (error) {
      const validationErrors = extractValidationErrors(error)
      if (validationErrors) throw validationErrors
      throw error
    }
  }

  const handleDeleteRole = async (id) => {
    await deleteRoleMutation.mutateAsync(id)
  }

  return {
    roles,
    isLoading,
    isError,
    error,
    createRoleMutation,
    updateRoleMutation,
    deleteRoleMutation,
    handleCreateRole,
    handleUpdateRole,
    handleDeleteRole,
  }
}
