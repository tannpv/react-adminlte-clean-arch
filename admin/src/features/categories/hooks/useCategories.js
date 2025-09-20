import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../api/categoriesApi'

const extractValidationErrors = (error) => {
  const status = error?.response?.status
  if (status !== 400) return null
  const fieldErrors = error?.response?.data?.errors || error?.response?.data?.error?.details?.fieldErrors
  if (!fieldErrors || typeof fieldErrors !== 'object') return null
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, value]) => [key, typeof value === 'string' ? value : value?.message || 'Invalid'])
  )
}

export function useCategories({ enabled = true } = {}) {
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

  const { data: categories = [], isLoading, isError, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled,
    staleTime: 5 * 60 * 1000,
  })

  const createCategoryMutation = useMutation({
    mutationFn: (payload) => createCategory(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['categories'] })
      toastr.success('Category created successfully')
    },
    onError: (e) => {
      const status = e?.response?.status
      if (status !== 400) toastr.error(e?.message || 'Failed to create category')
    },
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }) => updateCategory(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['categories'] })
      toastr.success('Category updated successfully')
    },
    onError: (e) => {
      const status = e?.response?.status
      if (status !== 400) toastr.error(e?.message || 'Failed to update category')
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['categories'] })
      toastr.success('Category deleted successfully')
    },
    onError: (e) => toastr.error(e?.message || 'Failed to delete category'),
  })

  const handleCreateCategory = async (payload) => {
    try {
      await createCategoryMutation.mutateAsync(payload)
    } catch (error) {
      const validationErrors = extractValidationErrors(error)
      if (validationErrors) throw validationErrors
      throw error
    }
  }

  const handleUpdateCategory = async (id, payload) => {
    try {
      await updateCategoryMutation.mutateAsync({ id, payload })
    } catch (error) {
      const validationErrors = extractValidationErrors(error)
      if (validationErrors) throw validationErrors
      throw error
    }
  }

  const handleDeleteCategory = async (id) => {
    await deleteCategoryMutation.mutateAsync(id)
  }

  return {
    categories,
    isLoading,
    isError,
    error,
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  }
}
