import React, { useState } from 'react'

export function CategoryFilter({
  selectedCategories,
  onCategoryChange,
  facets,
  isLoading
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFacets = facets.filter(facet =>
    facet.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCategoryToggle = (categoryId) => {
    const newSelection = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId]
    
    onCategoryChange(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedCategories.length === filteredFacets.length) {
      onCategoryChange([])
    } else {
      onCategoryChange(filteredFacets.map(facet => facet.id))
    }
  }

  return (
    <div className="category-filter">
      <div className="mb-2">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="mb-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={handleSelectAll}
          disabled={isLoading}
        >
          {selectedCategories.length === filteredFacets.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="category-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {filteredFacets.length === 0 ? (
          <div className="text-muted text-center py-2">
            <small>No categories found</small>
          </div>
        ) : (
          filteredFacets.map(facet => (
            <div key={facet.id} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`category-${facet.id}`}
                checked={selectedCategories.includes(facet.id)}
                onChange={() => handleCategoryToggle(facet.id)}
                disabled={isLoading}
              />
              <label className="form-check-label d-flex justify-content-between w-100" htmlFor={`category-${facet.id}`}>
                <span>{facet.name}</span>
                <span className="badge badge-secondary badge-sm">{facet.count}</span>
              </label>
            </div>
          ))
        )}
      </div>

      {selectedCategories.length > 0 && (
        <div className="mt-2">
          <small className="text-muted">
            {selectedCategories.length} category{selectedCategories.length !== 1 ? 'ies' : 'y'} selected
          </small>
        </div>
      )}
    </div>
  )
}
