import React, { useState } from 'react'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { usePermissions } from '../../../shared/hooks/usePermissions'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'
import { CategoryList } from '../components/CategoryList'
import { CategoryModal } from '../components/CategoryModal'
import { useCategories } from '../hooks/useCategories'
import { useCategorySearch } from '../hooks/useCategorySearch'

const isValidationErrorMap = (err) => {
  if (!err || typeof err !== 'object' || Array.isArray(err)) return false
  return Object.values(err).every((value) => typeof value === 'string')
}

export function CategoriesPage() {
  const { can } = usePermissions()
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'categories')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [targetCategory, setTargetCategory] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  const {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
  } = useCategorySearch()

  const canView = can('categories:read')
  const canCreate = can('categories:create')
  const canUpdate = can('categories:update')
  const canDelete = can('categories:delete')

  const {
    categories = [],
    tree = [],
    hierarchy = [],
    isLoading,
    isError,
    error,
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  } = useCategories({ enabled: canView, search: debouncedTerm })

  const submitting = createCategoryMutation.isPending || updateCategoryMutation.isPending

  // Calculate statistics
  const totalCategories = categories.length
  const rootCategories = categories.filter(cat => !cat.parentId).length
  const childCategories = categories.filter(cat => cat.parentId).length
  const maxDepth = Math.max(...categories.map(cat => cat.depth || 0), 0)

  return (
    <>
      <div className="page-card">
        <div className="page-header">
          <div>
            <h2 className="page-title">
              <i className="fas fa-tags mr-2"></i>
              {t('product_categories', 'Product Categories')}
            </h2>
            <p className="page-subtitle">
              {t('page_subtitle', 'Organize products into clear, navigable groups. Create hierarchical categories to improve product discovery and management.')}
            </p>
          </div>
          <div className="page-actions">
            <div className="search-control">
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                </div>
                <input
                  type="search"
                  className="form-control"
                  placeholder={t('search_placeholder', 'Search categories by name...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => { setEditing(null); setFormErrors({}); setModalOpen(true) }}
              disabled={!canCreate}
              title={!canCreate ? t('not_allowed', 'Not allowed') : undefined}
            >
              <i className="fas fa-plus mr-2"></i>
              {t('add_new_category', 'Add New Category')}
            </button>
          </div>
        </div>

        <div className="page-body">
          {!canView && (
            <div className="error-state">
              <div className="error-content">
                <i className="fas fa-ban error-icon"></i>
                <h4 className="error-title">{t('access_denied', 'Access Denied')}</h4>
                <p className="error-description">
                  {t('no_permission_view_categories', 'You do not have permission to view categories.')}
                </p>
              </div>
            </div>
          )}

          {canView && isLoading && (
            <div className="loading-state">
              <div className="loading-content">
                <i className="fas fa-spinner fa-spin loading-icon"></i>
                <h4 className="loading-title">{t('loading_categories', 'Loading Categories')}</h4>
                <p className="loading-description">{t('loading_categories_description', 'Please wait while we fetch your category information...')}</p>
              </div>
            </div>
          )}

          {canView && !isLoading && isError && (
            <div className="error-state">
              <div className="error-content">
                <i className="fas fa-exclamation-circle error-icon"></i>
                <h4 className="error-title">{t('failed_to_load_categories', 'Failed to Load Categories')}</h4>
                <p className="error-description">
                  {error?.message || t('unexpected_error_loading_categories', 'An unexpected error occurred while loading categories.')}
                </p>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-redo mr-2"></i>
                  {t('try_again', 'Try Again')}
                </button>
              </div>
            </div>
          )}

          {canView && !isLoading && !isError && (
            <div className="categories-content">
              {/* Statistics Dashboard */}
              <div className="categories-stats mb-4">
                <div className="row">
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-tags"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{totalCategories}</div>
                        <div className="stat-label">{t('total_categories', 'Total Categories')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-folder"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{rootCategories}</div>
                        <div className="stat-label">{t('root_categories', 'Root Categories')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-sitemap"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{childCategories}</div>
                        <div className="stat-label">{t('subcategories', 'Subcategories')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-layer-group"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{maxDepth}</div>
                        <div className="stat-label">{t('max_depth', 'Max Depth')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories List Section */}
              <div className="categories-table-section">
                <div className="section-header">
                  <h5 className="section-title">
                    <i className="fas fa-list mr-2"></i>
                    {t('category_management', 'Category Management')}
                  </h5>
                  <p className="section-description">
                    {t('manage_categories_description', 'Manage your product categories and their hierarchy.')}
                    {searchTerm && ` ${t('showing_results_for', 'Showing results for')} "${searchTerm}"`}
                  </p>
                </div>

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
              </div>
            </div>
          )}
        </div>
      </div>

      <CategoryModal
        show={modalOpen}
        title={editing?.id ? t('edit_category', 'Edit Category') : t('add_category', 'Add Category')}
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
        tree={tree}
        hierarchy={hierarchy}
      />

      <ConfirmModal
        show={confirmOpen}
        title={t('delete_category', 'Delete Category')}
        message={`${t('confirm_delete_category', 'Are you sure you want to delete')} ${targetCategory?.name || t('this_category', 'this category')}?`}
        confirmText={t('delete', 'Delete')}
        cancelText={t('cancel', 'Cancel')}
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