import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'
import {
  fetchProductAttributes,
  createProductAttribute,
  updateProductAttribute,
  deleteProductAttribute,
  createAttributeTerm,
  updateAttributeTerm,
  deleteAttributeTerm,
} from '../api/productAttributesApi'

const extractValidationErrors = (error) => {
  const status = error?.response?.status
  if (status !== 400) return null
  const fieldErrors = error?.response?.data?.errors || error?.response?.data?.error?.details?.fieldErrors
  if (!fieldErrors || typeof fieldErrors !== 'object') return null
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, value]) => [key, typeof value === 'string' ? value : value?.message || 'Invalid'])
  )
}

export function useProductAttributes({ enabled = true, staleTime = 5 * 60 * 1000 } = {}) {
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

  const query = useQuery({
    queryKey: ['product-attributes'],
    queryFn: fetchProductAttributes,
    enabled,
    staleTime,
  })

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ['product-attributes'] })
  }

  const createMutation = useMutation({
    mutationFn: createProductAttribute,
    onSuccess: async () => {
      await invalidate()
      toastr.success('Attribute created')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateProductAttribute(id, payload),
    onSuccess: async () => {
      await invalidate()
      toastr.success('Attribute updated')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProductAttribute,
    onSuccess: async () => {
      await invalidate()
      toastr.success('Attribute deleted')
    },
  })

  const createTermMutation = useMutation({
    mutationFn: ({ attributeId, payload }) => createAttributeTerm(attributeId, payload),
    onSuccess: async () => {
      await invalidate()
      toastr.success('Term added')
    },
  })

  const updateTermMutation = useMutation({
    mutationFn: ({ attributeId, termId, payload }) => updateAttributeTerm(attributeId, termId, payload),
    onSuccess: async () => {
      await invalidate()
      toastr.success('Term updated')
    },
  })

  const deleteTermMutation = useMutation({
    mutationFn: ({ attributeId, termId }) => deleteAttributeTerm(attributeId, termId),
    onSuccess: async () => {
      await invalidate()
      toastr.success('Term deleted')
    },
  })

  const wrap = async (fn) => {
    try {
      return await fn()
    } catch (error) {
      const validationErrors = extractValidationErrors(error)
      if (validationErrors) throw validationErrors
      throw error
    }
  }

  return {
    attributes: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createAttribute: (payload) => wrap(() => createMutation.mutateAsync(payload)),
    updateAttribute: (id, payload) => wrap(() => updateMutation.mutateAsync({ id, payload })),
    deleteAttribute: (id) => wrap(() => deleteMutation.mutateAsync(id)),
    createTerm: (attributeId, payload) => wrap(() => createTermMutation.mutateAsync({ attributeId, payload })),
    updateTerm: (attributeId, termId, payload) => wrap(() => updateTermMutation.mutateAsync({ attributeId, termId, payload })),
    deleteTerm: (attributeId, termId) => wrap(() => deleteTermMutation.mutateAsync({ attributeId, termId })),
    mutations: {
      createMutation,
      updateMutation,
      deleteMutation,
      createTermMutation,
      updateTermMutation,
      deleteTermMutation,
    },
  }
}
