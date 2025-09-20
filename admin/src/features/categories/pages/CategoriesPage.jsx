import React, { useState } from 'react'
import { CategoryList } from '../components/CategoryList'
import { CategoryModal } from '../components/CategoryModal'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { usePermissions } from '../../../shared/hooks/usePermissions'
import { useCategories } from '../hooks/useCategories'

const isValidationErrorMap = (err) => {
  if (!err || typeof err !== 'object' || Array.isArray(err)) return false
  return Object.values(err).every((value) => typeof value === 'string')
}

export function CategoriesPage() {
  const { can } = usePermissions()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [targetCategory, setTargetCategory] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  const canView = can('categories:read')
  const canCreate = can('categories:create')
  const canUpdate = can('categories:update')
  const canDelete = can('categories:delete')

  const {
    categories = [],
    isLoading,
    isError,
    error,
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  } = useCategories({ enabled: canView })

  const submitting = createCategoryMutation.isPending || updateCategoryMutation.isPending

  return (
    <>
      <div className="page-card">
        <div className="page-header">
          <div>
            <h2 className="page-title">Categories</h2>
            <p className="page-subtitle">Organize products into clear, navigable groups.</p>
          </div>
          <div className="page-actions">
            <button
              className="btn btn-primary"
              onClick={() => { setEditing(null); setFormErrors({}); setModalOpen(true) }}
              disabled={!canCreate}
              title={!canCreate ? 'Not allowed' : undefined}
            >
              Add Category
            </button>
          </div>
        </div>

        <div className="page-body">
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
        </div>
      </div>

      <CategoryModal
        show={modalOpen}
        title={editing?.id ? 'Edit Category' : 'Add Category'}
        initialCategory={editing}
        onClose={() => { setModalOpen(false); setEditing(null); setFormErrors({}) }}
        onSubmit={async (payload) => {
          setFormErrors({})
          try {
            if (editing?.id) {
              await handleUpdateCategory(editing.id, payload)
            } else {
              await handleCreateCategory(payload)
            }
            setModalOpen(false)
            setEditing(null)
          } catch (e) {
            if (isValidationErrorMap(e)) {
              setFormErrors(e)
            }
          }
        }}
        errors={formErrors}
        submitting={submitting}
        categories={categories}
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
          await handleDeleteCategory(id)
          setConfirmOpen(false)
          setTargetCategory(null)
          if (editing?.id === id) setEditing(null)
        }}
      />
    </>
  )
}
