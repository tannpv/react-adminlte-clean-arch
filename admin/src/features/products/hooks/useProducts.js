import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'
import { createProduct, deleteProduct, fetchProducts, updateProduct } from '../api/productsApi'
import { deserializeProduct, serializeProductPayload } from '../utils/productTransforms'

const extractValidationErrors = (error) => {
  const status = error?.response?.status
  if (status !== 400) return null
  const fieldErrors = error?.response?.data?.errors || error?.response?.data?.error?.details?.fieldErrors
  if (!fieldErrors || typeof fieldErrors !== 'object') return null
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, value]) => [key, typeof value === 'string' ? value : value?.message || 'Invalid'])
  )
}

export function useProducts({ search } = {}) {
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

  const { data: rawProducts = [], isLoading, isError, error } = useQuery({
    queryKey: ['products', { search: searchValue }],
    queryFn: () => fetchProducts({ search: searchValue }),
    keepPreviousData: true,
  })

  const products = React.useMemo(() => rawProducts.map((product) => deserializeProduct(product)), [rawProducts])

  const createProductMutation = useMutation({
    mutationFn: (payload) => createProduct(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['products'] })
      toastr.success('Product created successfully')
    },
    onError: (e) => {
      const status = e?.response?.status
      if (status !== 400) toastr.error(e?.message || 'Failed to create product')
    },
  })

  const updateProductMutation = useMutation({
    mutationFn: ({ id, payload }) => updateProduct(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['products'] })
      toastr.success('Product updated successfully')
    },
    onError: (e) => {
      const status = e?.response?.status
      if (status !== 400) toastr.error(e?.message || 'Failed to update product')
    },
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['products'] })
      toastr.success('Product deleted successfully')
    },
    onError: (e) => toastr.error(e?.message || 'Failed to delete product'),
  })

  const handleCreateProduct = async (payload) => {
    try {
      const prepared = serializeProductPayload(payload)
      await createProductMutation.mutateAsync(prepared)
    } catch (error) {
      const validationErrors = extractValidationErrors(error)
      if (validationErrors) throw validationErrors
      throw error
    }
  }

  const handleUpdateProduct = async (id, payload) => {
    try {
      const prepared = serializeProductPayload(payload)
      await updateProductMutation.mutateAsync({ id, payload: prepared })
    } catch (error) {
      const validationErrors = extractValidationErrors(error)
      if (validationErrors) throw validationErrors
      throw error
    }
  }

  const handleDeleteProduct = async (id) => {
    await deleteProductMutation.mutateAsync(id)
  }

  return {
    products,
    isLoading,
    isError,
    error,
    createProductMutation,
    updateProductMutation,
    deleteProductMutation,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
  }
}
