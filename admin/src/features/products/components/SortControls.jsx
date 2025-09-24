import React from 'react'

export function SortControls({ sortBy, sortOrder, onSortChange, isLoading }) {
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Last Updated' }
  ]

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      // Toggle order if same field
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
      onSortChange(newSortBy, newOrder)
    } else {
      // Default to ascending for new field
      onSortChange(newSortBy, 'asc')
    }
  }

  return (
    <div className="sort-controls">
      <div className="d-flex align-items-center">
        <label className="form-label mb-0 mr-2 small">Sort by:</label>
        <div className="btn-group" role="group">
          {sortOptions.map(option => (
            <button
              key={option.value}
              type="button"
              className={`btn btn-sm ${
                sortBy === option.value 
                  ? 'btn-primary' 
                  : 'btn-outline-secondary'
              }`}
              onClick={() => handleSortChange(option.value)}
              disabled={isLoading}
            >
              {option.label}
              {sortBy === option.value && (
                <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
