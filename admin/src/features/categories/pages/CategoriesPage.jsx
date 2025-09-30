import React, { useState } from 'react'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import Button from '../../../shared/components/ui/Button'
import Card from '../../../shared/components/ui/Card'
import { usePermissions } from '../../../shared/hooks/usePermissions'
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
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <i className="fas fa-tags mr-3 text-blue-600"></i>
                Product Categories
              </h1>
              <p className="mt-2 text-gray-600 max-w-2xl">
                Organize products into clear, navigable groups. Create hierarchical categories to improve product discovery and management.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <input
                  type="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search categories by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="primary"
                onClick={() => { setEditing(null); setFormErrors({}); setModalOpen(true) }}
                disabled={!canCreate}
                title={!canCreate ? 'Not allowed' : undefined}
              >
                <i className="fas fa-plus mr-2"></i>
                Add New Category
              </Button>
            </div>
          </div>
        </div>

        {/* Permission Warning */}
        {!canView && (
          <Card className="mb-6">
            <Card.Body>
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-md">
                <i className="fas fa-ban text-red-600 mr-3"></i>
                <div>
                  <h4 className="text-red-800 font-medium">Access Denied</h4>
                  <p className="text-red-700 text-sm">
                    You do not have permission to view categories.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Loading State */}
        {canView && isLoading && (
          <Card>
            <Card.Body>
              <div className="text-center py-12">
                <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Loading Categories</h4>
                <p className="text-gray-600">Please wait while we fetch your category information...</p>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Error State */}
        {canView && !isLoading && isError && (
          <Card>
            <Card.Body>
              <div className="text-center py-12">
                <i className="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Categories</h4>
                <p className="text-gray-600 mb-6">
                  {error?.message || 'An unexpected error occurred while loading categories.'}
                </p>
                <Button
                  variant="outline-primary"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-redo mr-2"></i>
                  Try Again
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Categories Content */}
        {canView && !isLoading && !isError && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <i className="fas fa-tags text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold">{totalCategories}</div>
                    <div className="text-blue-100">Total Categories</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <i className="fas fa-folder text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold">{rootCategories}</div>
                    <div className="text-green-100">Root Categories</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <i className="fas fa-sitemap text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold">{childCategories}</div>
                    <div className="text-purple-100">Subcategories</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                <div className="flex items-center">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <i className="fas fa-layer-group text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold">{maxDepth}</div>
                    <div className="text-orange-100">Max Depth</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories List Section */}
            <Card>
              <Card.Header>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <i className="fas fa-list mr-2 text-blue-600"></i>
                      Category Management
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Manage your product categories and their hierarchy.
                      {searchTerm && ` Showing results for "${searchTerm}"`}
                    </p>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
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
              </Card.Body>
            </Card>
          </div>
        )}
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
        tree={tree}
        hierarchy={hierarchy}
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

export default CategoriesPage;