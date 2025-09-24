import React from 'react'
import { ProductCard } from './ProductCard'
import { Pagination } from './Pagination'
import { SortControls } from './SortControls'

export function SearchResultsGrid({
  products,
  total,
  page,
  limit,
  totalPages,
  sortBy,
  sortOrder,
  onPageChange,
  onSortChange,
  isLoading,
  error
}) {
  if (error) {
    return (
      <div className="search-results">
        <div className="card">
          <div className="card-body text-center">
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Error loading products: {error.message || 'Unknown error'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading && products.length === 0) {
    return (
      <div className="search-results">
        <div className="card">
          <div className="card-body text-center">
            <div className="d-flex justify-content-center align-items-center py-5">
              <i className="fas fa-spinner fa-spin fa-2x mr-3"></i>
              <span>Loading products...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="search-results">
        <div className="card">
          <div className="card-body text-center">
            <div className="py-5">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No products found</h5>
              <p className="text-muted">Try adjusting your search criteria or filters.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="search-results">
      {/* Results Header */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h6 className="mb-0">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} products
              </h6>
            </div>
            <div className="col-md-6 text-right">
              <SortControls
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        <div className="row">
          {products.map(product => (
            <div key={product.id} className="col-lg-4 col-md-6 mb-4">
              <ProductCard
                product={product}
                isLoading={isLoading}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && products.length > 0 && (
        <div className="loading-overlay">
          <div className="d-flex justify-content-center align-items-center">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
