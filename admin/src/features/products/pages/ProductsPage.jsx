import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCategories } from '../../categories/api/categoriesApi'
import { ProductList } from '../components/ProductList'
import { ProductModal } from '../components/ProductModal'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { usePermissions } from '../../../shared/hooks/usePermissions'
import { useProducts } from '../hooks/useProducts'

const isValidationErrorMap = (err) => {
  if (!err || typeof err !== 'object' || Array.isArray(err)) return false
  return Object.values(err).every((value) => typeof value === 'string')
}

export function ProductsPage() {
  const qc = useQueryClient()
  const { can } = usePermissions()
  const {
    products = [],
    isLoading,
    isError,
    error,
    createProductMutation,
    updateProductMutation,
    deleteProductMutation,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
  } = useProducts()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetProduct, setTargetProduct] = useState(null)
  const cachedCategories = qc.getQueryData(['categories'])
  const canViewCategories = can('categories:read')
  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: modalOpen || !!cachedCategories || can('products:create') || can('products:update') || canViewCategories,
    initialData: cachedCategories,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  })
  const categoryOptions = Array.isArray(categories) ? categories : []

  const submitting = createProductMutation.isPending || updateProductMutation.isPending

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
        <div>
          <button
            className="btn btn-outline-secondary mr-2"
            onClick={() => qc.invalidateQueries({ queryKey: ['categories'] })}
            disabled={categoriesLoading}
            title={categoriesLoading ? 'Refreshing…' : 'Refresh categories'}
          >
            Refresh Categories
          </button>
          <button
            className="btn btn-primary"
            onClick={() => openModal({})}
            disabled={!can('products:create')}
            title={!can('products:create') ? 'Not allowed' : undefined}
          >
            Add Product
          </button>
        </div>
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
          setFormErrors({})
          try {
            if (editing?.id) {
              await handleUpdateProduct(editing.id, payload)
            } else {
              await handleCreateProduct(payload)
            }
            closeModal()
          } catch (e) {
            if (isValidationErrorMap(e)) {
              setFormErrors(e)
            }
          }
        }}
        categoryOptions={categoryOptions}
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
          await handleDeleteProduct(targetProduct.id)
          setConfirmOpen(false)
          setTargetProduct(null)
        }}
      />
    </>
  )
}
