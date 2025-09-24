import React, { useState } from 'react'
import { CategoryFilter } from './filters/CategoryFilter'
import { AttributeFilter } from './filters/AttributeFilter'
import { PriceRangeFilter } from './filters/PriceRangeFilter'
import { StatusFilter } from './filters/StatusFilter'
import { TypeFilter } from './filters/TypeFilter'

export function FilterSidebar({
  searchParams,
  onSearchChange,
  facets,
  isLoading
}) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    attributes: true,
    price: true,
    status: true,
    type: true
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleFilterChange = (filterType, value) => {
    onSearchChange({ [filterType]: value })
  }

  return (
    <div className="filter-sidebar">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-filter mr-2"></i>
            Filters
          </h5>
        </div>
        <div className="card-body">
          {/* Categories Filter */}
          <div className="filter-section mb-4">
            <div
              className="filter-section-header d-flex justify-content-between align-items-center cursor-pointer"
              onClick={() => toggleSection('categories')}
            >
              <h6 className="mb-0">Categories</h6>
              <i className={`fas fa-chevron-${expandedSections.categories ? 'up' : 'down'}`}></i>
            </div>
            {expandedSections.categories && (
              <div className="filter-section-content mt-2">
                <CategoryFilter
                  selectedCategories={searchParams.categoryIds || []}
                  onCategoryChange={(categories) => handleFilterChange('categoryIds', categories)}
                  facets={facets?.categories || []}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>

          {/* Attributes Filter */}
          <div className="filter-section mb-4">
            <div
              className="filter-section-header d-flex justify-content-between align-items-center cursor-pointer"
              onClick={() => toggleSection('attributes')}
            >
              <h6 className="mb-0">Attributes</h6>
              <i className={`fas fa-chevron-${expandedSections.attributes ? 'up' : 'down'}`}></i>
            </div>
            {expandedSections.attributes && (
              <div className="filter-section-content mt-2">
                <AttributeFilter
                  selectedAttributes={searchParams.attributeIds || []}
                  selectedAttributeValues={searchParams.attributeValueIds || []}
                  onAttributeChange={(attributes) => handleFilterChange('attributeIds', attributes)}
                  onAttributeValueChange={(values) => handleFilterChange('attributeValueIds', values)}
                  facets={facets?.attributes || []}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="filter-section mb-4">
            <div
              className="filter-section-header d-flex justify-content-between align-items-center cursor-pointer"
              onClick={() => toggleSection('price')}
            >
              <h6 className="mb-0">Price Range</h6>
              <i className={`fas fa-chevron-${expandedSections.price ? 'up' : 'down'}`}></i>
            </div>
            {expandedSections.price && (
              <div className="filter-section-content mt-2">
                <PriceRangeFilter
                  minPrice={searchParams.minPrice}
                  maxPrice={searchParams.maxPrice}
                  onPriceChange={(min, max) => {
                    handleFilterChange('minPrice', min)
                    handleFilterChange('maxPrice', max)
                  }}
                  priceRange={facets?.priceRange}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="filter-section mb-4">
            <div
              className="filter-section-header d-flex justify-content-between align-items-center cursor-pointer"
              onClick={() => toggleSection('status')}
            >
              <h6 className="mb-0">Status</h6>
              <i className={`fas fa-chevron-${expandedSections.status ? 'up' : 'down'}`}></i>
            </div>
            {expandedSections.status && (
              <div className="filter-section-content mt-2">
                <StatusFilter
                  selectedStatuses={searchParams.statuses || []}
                  onStatusChange={(statuses) => handleFilterChange('statuses', statuses)}
                  facets={facets?.statuses || []}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>

          {/* Type Filter */}
          <div className="filter-section mb-4">
            <div
              className="filter-section-header d-flex justify-content-between align-items-center cursor-pointer"
              onClick={() => toggleSection('type')}
            >
              <h6 className="mb-0">Product Type</h6>
              <i className={`fas fa-chevron-${expandedSections.type ? 'up' : 'down'}`}></i>
            </div>
            {expandedSections.type && (
              <div className="filter-section-content mt-2">
                <TypeFilter
                  selectedTypes={searchParams.types || []}
                  onTypeChange={(types) => handleFilterChange('types', types)}
                  facets={facets?.types || []}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
