import React, { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../api/productsApi'
import { ProductList } from '../components/ProductList'
import { ProductModal } from '../components/ProductModal'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { usePermissions } from '../../../shared/hooks/usePermissions'

export function ProductsPage() {
  const qc = useQueryClient()
  const { can } = usePermissions()
  const { data: products = [], isLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetProduct, setTargetProduct] = useState(null)

  useEffect(() => {
    toastr.options = {
      positionClass: 'toast-top-right',
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
      newestOnTop: true,
    }
  }, [])

  const createMutation = useMutation({
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

  const updateMutation = useMutation({
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

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['products'] })
      toastr.success('Product deleted successfully')
    },
    onError: (e) => toastr.error(e?.message || 'Failed to delete product'),
  })

  const openModal = (product = null) => {
    setEditing(product)
    setFormErrors({})
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setFormErrors({})
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Products</h3>
        <button
          className="btn btn-primary"
          onClick={() => openModal({})}
          disabled={!can('products:create')}
          title={!can('products:create') ? 'Not allowed' : undefined}
        >
          Add Product
        </button>
      </div>

      {isLoading && <div>Loading...</div>}
      {!isLoading && isError && (
        <div className="alert alert-danger" role="alert">
          {error?.message || 'Failed to load products'}
        </div>
      )}
      {!isLoading && !isError && (
        <ProductList
          products={products}
          onEdit={(product) => { if (!can('products:update')) return; openModal(product) }}
          onDelete={(product) => {
            if (!can('products:delete')) return
            setTargetProduct(product)
            setConfirmOpen(true)
          }}
        />
      )}

      <ProductModal
        show={modalOpen}
        title={editing?.id ? 'Edit Product' : 'Add Product'}
        initialProduct={editing}
        errors={formErrors}
        submitting={submitting}
        onClose={closeModal}
        onSubmit={async (payload) => {
          setSubmitting(true)
          setFormErrors({})
          try {
            if (editing?.id) {
              await updateMutation.mutateAsync({ id: editing.id, payload })
            } else {
              await createMutation.mutateAsync(payload)
            }
            closeModal()
          } catch (e) {
            const status = e?.response?.status
            const vErrors = e?.response?.data?.errors || e?.response?.data?.error?.details?.fieldErrors
            if (status === 400 && vErrors && typeof vErrors === 'object') {
              const normalized = Object.fromEntries(
                Object.entries(vErrors).map(([k, v]) => [k, typeof v === 'string' ? v : v?.message || 'Invalid'])
              )
              setFormErrors(normalized)
            }
          } finally {
            setSubmitting(false)
          }
        }}
      />

      <ConfirmModal
        show={confirmOpen}
        title="Delete Product"
        message={`Are you sure you want to delete ${targetProduct?.name || 'this product'}?`}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => { setConfirmOpen(false); setTargetProduct(null) }}
        onConfirm={async () => {
          if (!targetProduct?.id) return
          await deleteMutation.mutateAsync(targetProduct.id)
          setConfirmOpen(false)
          setTargetProduct(null)
        }}
      />
    </>
  )
}
