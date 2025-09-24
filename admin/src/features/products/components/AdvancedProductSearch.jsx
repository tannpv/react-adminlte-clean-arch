import React, { useState, useEffect, useCallback } from 'react'
import { FilterSidebar } from './FilterSidebar'
import { SearchResultsGrid } from './SearchResultsGrid'
import { SearchHeader } from './SearchHeader'
import { useAdvancedProductSearch } from '../hooks/useAdvancedProductSearch'

export function AdvancedProductSearch() {
  const [searchParams, setSearchParams] = useState({
    search: '',
    categoryIds: [],
    attributeIds: [],
    attributeValueIds: [],
    minPrice: undefined,
    maxPrice: undefined,
    statuses: [],
    types: [],
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 20
  })

  const [showFilters, setShowFilters] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const {
    data: searchResults,
    error,
    refetch,
    isFetching
  } = useAdvancedProductSearch(searchParams)

  const handleSearchChange = useCallback((newParams) => {
    setSearchParams(prev => ({
      ...prev,
      ...newParams,
      page: 1 // Reset to first page when filters change
    }))
  }, [])

  const handlePageChange = useCallback((page) => {
    setSearchParams(prev => ({ ...prev, page }))
  }, [])

  const handleSortChange = useCallback((sortBy, sortOrder) => {
    setSearchParams(prev => ({ ...prev, sortBy, sortOrder, page: 1 }))
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearchParams({
      search: '',
      categoryIds: [],
      attributeIds: [],
      attributeValueIds: [],
      minPrice: undefined,
      maxPrice: undefined,
      statuses: [],
      types: [],
      sortBy: 'name',
      sortOrder: 'asc',
      page: 1,
      limit: 20
    })
  }, [])

  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev)
  }, [])

  return (
    <div className="advanced-product-search">
      <div className="container-fluid">
        <SearchHeader
          searchParams={searchParams}
          onSearchChange={handleSearchChange}
          onToggleFilters={handleToggleFilters}
          onClearFilters={handleClearFilters}
          showFilters={showFilters}
          totalResults={searchResults?.total || 0}
          isLoading={isFetching}
        />

        <div className="row">
          {showFilters && (
            <div className="col-lg-3 col-md-4">
              <FilterSidebar
                searchParams={searchParams}
                onSearchChange={handleSearchChange}
                facets={searchResults?.facets}
                isLoading={isFetching}
              />
            </div>
          )}

          <div className={showFilters ? "col-lg-9 col-md-8" : "col-12"}>
            <SearchResultsGrid
              products={searchResults?.products || []}
              total={searchResults?.total || 0}
              page={searchParams.page}
              limit={searchParams.limit}
              totalPages={searchResults?.totalPages || 0}
              sortBy={searchParams.sortBy}
              sortOrder={searchParams.sortOrder}
              onPageChange={handlePageChange}
              onSortChange={handleSortChange}
              isLoading={isFetching}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
