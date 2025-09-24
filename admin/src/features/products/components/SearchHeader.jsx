import React, { useState, useEffect } from 'react'

export function SearchHeader({
  searchParams,
  onSearchChange,
  onToggleFilters,
  onClearFilters,
  showFilters,
  totalResults,
  isLoading
}) {
  const [searchInput, setSearchInput] = useState(searchParams.search || '')

  useEffect(() => {
    setSearchInput(searchParams.search || '')
  }, [searchParams.search])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    onSearchChange({ search: searchInput.trim() })
  }

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value)
  }

  const hasActiveFilters = () => {
    return (
      searchParams.categoryIds?.length > 0 ||
      searchParams.attributeIds?.length > 0 ||
      searchParams.attributeValueIds?.length > 0 ||
      searchParams.minPrice !== undefined ||
      searchParams.maxPrice !== undefined ||
      searchParams.statuses?.length > 0 ||
      searchParams.types?.length > 0
    )
  }

  return (
    <div className="search-header mb-4">
      <div className="card">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <form onSubmit={handleSearchSubmit} className="d-flex">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search products by name, SKU, or description..."
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    disabled={isLoading}
                  />
                  <div className="input-group-append">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-search"></i>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="col-md-6 text-right">
              <div className="d-flex align-items-center justify-content-end gap-2">
                <span className="text-muted">
                  {totalResults} {totalResults === 1 ? 'product' : 'products'} found
                </span>

                <button
                  type="button"
                  className={`btn btn-outline-secondary btn-sm ${showFilters ? 'active' : ''}`}
                  onClick={onToggleFilters}
                  disabled={isLoading}
                >
                  <i className="fas fa-filter"></i>
                  Filters
                </button>

                {hasActiveFilters() && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={onClearFilters}
                    disabled={isLoading}
                  >
                    <i className="fas fa-times"></i>
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="mt-3">
              <div className="active-filters">
                <small className="text-muted">Active filters:</small>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {searchParams.categoryIds?.length > 0 && (
                    <span className="badge badge-info">
                      Categories ({searchParams.categoryIds.length})
                    </span>
                  )}
                  {searchParams.attributeIds?.length > 0 && (
                    <span className="badge badge-info">
                      Attributes ({searchParams.attributeIds.length})
                    </span>
                  )}
                  {searchParams.attributeValueIds?.length > 0 && (
                    <span className="badge badge-info">
                      Values ({searchParams.attributeValueIds.length})
                    </span>
                  )}
                  {(searchParams.minPrice !== undefined || searchParams.maxPrice !== undefined) && (
                    <span className="badge badge-info">
                      Price: ${searchParams.minPrice || 0} - ${searchParams.maxPrice || '∞'}
                    </span>
                  )}
                  {searchParams.statuses?.length > 0 && (
                    <span className="badge badge-info">
                      Status: {searchParams.statuses.join(', ')}
                    </span>
                  )}
                  {searchParams.types?.length > 0 && (
                    <span className="badge badge-info">
                      Type: {searchParams.types.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
