import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../api/categoriesApi'
import { CategoryList } from '../components/CategoryList'
import { CategoryModal } from '../components/CategoryModal'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { usePermissions } from '../../../shared/hooks/usePermissions'

export function CategoriesPage() {
  const qc = useQueryClient()
  const { can } = usePermissions()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [targetCategory, setTargetCategory] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const canView = can('categories:read')
  const canCreate = can('categories:create')
  const canUpdate = can('categories:update')
  const canDelete = can('categories:delete')

  const {
    data: categoriesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: canView,
  })

  const categories = Array.isArray(categoriesData) ? categoriesData : []

  const createMutation = useMutation({
    mutationFn: (payload) => createCategory(payload),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['categories'] }) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateCategory(id, payload),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['categories'] }) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['categories'] }) },
  })

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Categories</h3>
        <button
          className="btn btn-primary"
          onClick={() => { setEditing(null); setFormErrors({}); setModalOpen(true) }}
          disabled={!canCreate}
          title={!canCreate ? 'Not allowed' : undefined}
        >
          Add Category
        </button>
      </div>

      {!canView && (
        <div className="alert alert-warning" role="alert">
          You do not have permission to view categories.
        </div>
      )}

      {canView && isLoading && <div>Loading...</div>}
      {canView && !isLoading && isError && (
        <div className="alert alert-danger" role="alert">{error?.message || 'Failed to load categories'}</div>
      )}
      {canView && !isLoading && !isError && (
        <CategoryList
          categories={categories}
          canEdit={canUpdate}
          canDelete={canDelete}
          onEdit={(category) => {
            setEditing(category)
            setFormErrors({})
            setModalOpen(true)
          }}
          onDelete={(id) => {
            const category = categories.find((c) => c.id === id)
            setTargetCategory(category || { id })
            setConfirmOpen(true)
          }}
        />
      )}

      <CategoryModal
        show={modalOpen}
        title={editing?.id ? 'Edit Category' : 'Add Category'}
        initialCategory={editing}
        onClose={() => { setModalOpen(false); setEditing(null); setFormErrors({}) }}
        onSubmit={async (payload) => {
          setSubmitting(true)
          setFormErrors({})
          try {
            if (editing?.id) {
              await updateMutation.mutateAsync({ id: editing.id, payload })
            } else {
              await createMutation.mutateAsync(payload)
            }
            setModalOpen(false)
            setEditing(null)
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
        errors={formErrors}
        submitting={submitting}
      />

      <ConfirmModal
        show={confirmOpen}
        title="Delete Category"
        message={`Are you sure you want to delete ${targetCategory?.name || 'this category'}?`}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => { setConfirmOpen(false); setTargetCategory(null) }}
        onConfirm={async () => {
          const id = targetCategory?.id
          if (!id) return
          await deleteMutation.mutateAsync(id)
          setConfirmOpen(false)
          setTargetCategory(null)
          if (editing?.id === id) setEditing(null)
        }}
      />
    </>
  )
}
