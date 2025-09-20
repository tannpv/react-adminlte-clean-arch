import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateProductAttribute(id, payload),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProductAttribute,
    onSuccess: invalidate,
  })

  const createTermMutation = useMutation({
    mutationFn: ({ attributeId, payload }) => createAttributeTerm(attributeId, payload),
    onSuccess: invalidate,
  })

  const updateTermMutation = useMutation({
    mutationFn: ({ attributeId, termId, payload }) => updateAttributeTerm(attributeId, termId, payload),
    onSuccess: invalidate,
  })

  const deleteTermMutation = useMutation({
    mutationFn: ({ attributeId, termId }) => deleteAttributeTerm(attributeId, termId),
    onSuccess: invalidate,
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
