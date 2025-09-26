import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import Button from '../../../shared/components/ui/Button'
import Card from '../../../shared/components/ui/Card'
import { usePermissions } from '../../../shared/hooks/usePermissions'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'
import { fetchCategories } from '../../categories/api/categoriesApi'
import { ProductList } from '../components/ProductList'
import { ProductModal } from '../components/ProductModal'
import { useProducts } from '../hooks/useProducts'
import { useProductSearch } from '../hooks/useProductSearch'

const isValidationErrorMap = (err) => {
  if (!err || typeof err !== 'object' || Array.isArray(err)) return false
  return Object.values(err).every((value) => typeof value === 'string')
}

export function ProductsPage() {
  const qc = useQueryClient()
  const { can } = usePermissions()
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'products')

  const {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
  } = useProductSearch()

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
  } = useProducts({ search: debouncedTerm })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetProduct, setTargetProduct] = useState(null)
  const cachedCategories = qc.getQueryData(['categories'])
  const canViewCategories = can('categories:read')
  const {
    data: categoriesData = { categories: [], tree: [], hierarchy: [] },
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: modalOpen || !!cachedCategories || can('products:create') || can('products:update') || canViewCategories,
    initialData: cachedCategories,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  })

  // Extract categories from the new response structure
  const categoryOptions = Array.isArray(categoriesData.categories) ? categoriesData.categories : []
  const categoryTree = Array.isArray(categoriesData.tree) ? categoriesData.tree : []

  const submitting = createProductMutation.isPending || updateProductMutation.isPending

  // Calculate statistics
  const totalProducts = products.length
  const publishedProducts = products.filter(product => product.status === 'published').length
  const draftProducts = products.filter(product => product.status === 'draft').length
  const variableProducts = products.filter(product => product.type === 'variable').length
  const totalValue = products.reduce((sum, product) => {
    const price = typeof product.price === 'number' ? product.price : (product.priceCents || 0) / 100
    return sum + price
  }, 0)

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  }

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
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <i className="fas fa-box mr-3 text-blue-600"></i>
                {t('title', 'Product Catalog')}
              </h1>
              <p className="mt-2 text-gray-600 max-w-2xl">
                {t('subtitle', 'Keep your catalog up to date and aligned with inventory. Manage products, pricing, and categories to drive sales.')}
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
                  placeholder={t('search_placeholder', 'Search products by name or SKU...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline-secondary"
                onClick={() => qc.invalidateQueries({ queryKey: ['categories'] })}
                disabled={categoriesLoading}
                title={categoriesLoading ? t('refreshing', 'Refreshing…') : t('refresh_categories_tooltip', 'Refresh categories')}
              >
                <i className="fas fa-sync-alt mr-2"></i>
                {t('refresh_categories', 'Refresh Categories')}
              </Button>
              <Button
                variant="primary"
                onClick={() => openModal({})}
                disabled={!can('products:create')}
                title={!can('products:create') ? t('not_allowed', 'Not allowed') : undefined}
              >
                <i className="fas fa-plus mr-2"></i>
                {t('add_product', 'Add New Product')}
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <Card.Body>
              <div className="text-center py-12">
                <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                <h4 className="text-lg font-medium text-gray-900 mb-2">{t('loading_title', 'Loading Products')}</h4>
                <p className="text-gray-600">{t('loading_description', 'Please wait while we fetch your product catalog...')}</p>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <Card>
            <Card.Body>
              <div className="text-center py-12">
                <i className="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
                <h4 className="text-lg font-medium text-gray-900 mb-2">{t('failed_to_load_products', 'Failed to Load Products')}</h4>
                <p className="text-gray-600 mb-6">
                  {error?.message || t('unexpected_error_loading_products', 'An unexpected error occurred while loading products.')}
                </p>
                <Button
                  variant="outline-primary"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-redo mr-2"></i>
                  {t('try_again', 'Try Again')}
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Products Content */}
        {!isLoading && !isError && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <i className="fas fa-box text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold">{totalProducts}</div>
                    <div className="text-blue-100">{t('total_products', 'Total Products')}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <i className="fas fa-eye text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold">{publishedProducts}</div>
                    <div className="text-green-100">{t('published', 'Published')}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <i className="fas fa-cogs text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold">{variableProducts}</div>
                    <div className="text-purple-100">{t('variable_products', 'Variable Products')}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                <div className="flex items-center">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <i className="fas fa-dollar-sign text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold">{formatCurrency(totalValue)}</div>
                    <div className="text-orange-100">{t('total_value', 'Total Value')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products List Section */}
            <Card>
              <Card.Header>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <i className="fas fa-list mr-2 text-blue-600"></i>
                      {t('product_management', 'Product Management')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {t('product_management_description', 'Manage your product catalog, pricing, and inventory.')}
                      {searchTerm && ` ${t('showing_results_for', 'Showing results for')} "${searchTerm}"`}
                    </p>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <ProductList
                  products={products}
                  onEdit={(product) => { if (!can('products:update')) return; openModal(product) }}
                  onDelete={(product) => {
                    if (!can('products:delete')) return
                    setTargetProduct(product)
                    setConfirmOpen(true)
                  }}
                />
              </Card.Body>
            </Card>
          </div>
        )}
      </div>

      <ProductModal
        show={modalOpen}
        title={editing?.id ? t('edit_product', 'Edit Product') : t('add_product', 'Add Product')}
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
        categoryTree={categoryTree}
        categoriesLoading={categoriesLoading}
      />

      <ConfirmModal
        show={confirmOpen}
        title={t('delete_product', 'Delete Product')}
        message={t('confirm_delete_product', `Are you sure you want to delete ${targetProduct?.name || 'this product'}?`)}
        confirmText={t('delete', 'Delete')}
        cancelText={t('cancel', 'Cancel')}
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

export default ProductsPage;