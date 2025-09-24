import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
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
      <div className="page-card">
        <div className="page-header">
          <div>
            <h2 className="page-title">
              <i className="fas fa-box mr-2"></i>
              {t('title', 'Product Catalog')}
            </h2>
            <p className="page-subtitle">
              {t('subtitle', 'Keep your catalog up to date and aligned with inventory. Manage products, pricing, and categories to drive sales.')}
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
                  placeholder={t('search_placeholder', 'Search products by name or SKU...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <button
              className="btn btn-outline-secondary"
              onClick={() => qc.invalidateQueries({ queryKey: ['categories'] })}
              disabled={categoriesLoading}
              title={categoriesLoading ? t('refreshing', 'Refreshing…') : t('refresh_categories_tooltip', 'Refresh categories')}
            >
              <i className="fas fa-sync-alt mr-2"></i>
              {t('refresh_categories', 'Refresh Categories')}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => openModal({})}
              disabled={!can('products:create')}
              title={!can('products:create') ? t('not_allowed', 'Not allowed') : undefined}
            >
              <i className="fas fa-plus mr-2"></i>
              {t('add_product', 'Add New Product')}
            </button>
          </div>
        </div>

        <div className="page-body">
          {isLoading && (
            <div className="loading-state">
              <div className="loading-content">
                <i className="fas fa-spinner fa-spin loading-icon"></i>
                <h4 className="loading-title">{t('loading_title', 'Loading Products')}</h4>
                <p className="loading-description">{t('loading_description', 'Please wait while we fetch your product catalog...')}</p>
              </div>
            </div>
          )}

          {!isLoading && isError && (
            <div className="error-state">
              <div className="error-content">
                <i className="fas fa-exclamation-circle error-icon"></i>
                <h4 className="error-title">{t('failed_to_load_products', 'Failed to Load Products')}</h4>
                <p className="error-description">
                  {error?.message || t('unexpected_error_loading_products', 'An unexpected error occurred while loading products.')}
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

          {!isLoading && !isError && (
            <div className="products-content">
              {/* Statistics Dashboard */}
              <div className="products-stats mb-4">
                <div className="row">
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-box"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{totalProducts}</div>
                        <div className="stat-label">{t('total_products', 'Total Products')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-eye"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{publishedProducts}</div>
                        <div className="stat-label">{t('published', 'Published')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-cogs"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{variableProducts}</div>
                        <div className="stat-label">{t('variable_products', 'Variable Products')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-dollar-sign"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{formatCurrency(totalValue)}</div>
                        <div className="stat-label">{t('total_value', 'Total Value')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products List Section */}
              <div className="products-table-section">
                <div className="section-header">
                  <h5 className="section-title">
                    <i className="fas fa-list mr-2"></i>
                    {t('product_management', 'Product Management')}
                  </h5>
                  <p className="section-description">
                    {t('product_management_description', 'Manage your product catalog, pricing, and inventory.')}
                    {searchTerm && ` ${t('showing_results_for', 'Showing results for')} "${searchTerm}"`}
                  </p>
                </div>

                <ProductList
                  products={products}
                  onEdit={(product) => { if (!can('products:update')) return; openModal(product) }}
                  onDelete={(product) => {
                    if (!can('products:delete')) return
                    setTargetProduct(product)
                    setConfirmOpen(true)
                  }}
                />
              </div>
            </div>
          )}
        </div>
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