import React from 'react'

export function TypeFilter({
  selectedTypes,
  onTypeChange,
  facets,
  isLoading
}) {
  const handleTypeToggle = (type) => {
    const newSelection = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type]
    
    onTypeChange(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedTypes.length === facets.length) {
      onTypeChange([])
    } else {
      onTypeChange(facets.map(facet => facet.type))
    }
  }

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'simple':
        return 'badge-primary'
      case 'variable':
        return 'badge-info'
      default:
        return 'badge-light'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'simple':
        return 'fas fa-box'
      case 'variable':
        return 'fas fa-layer-group'
      default:
        return 'fas fa-cube'
    }
  }

  return (
    <div className="type-filter">
      <div className="mb-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={handleSelectAll}
          disabled={isLoading}
        >
          {selectedTypes.length === facets.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="type-list">
        {facets.length === 0 ? (
          <div className="text-muted text-center py-2">
            <small>No types found</small>
          </div>
        ) : (
          facets.map(facet => (
            <div key={facet.type} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`type-${facet.type}`}
                checked={selectedTypes.includes(facet.type)}
                onChange={() => handleTypeToggle(facet.type)}
                disabled={isLoading}
              />
              <label className="form-check-label d-flex justify-content-between w-100" htmlFor={`type-${facet.type}`}>
                <div className="d-flex align-items-center">
                  <i className={`${getTypeIcon(facet.type)} mr-2`}></i>
                  <span className={`badge ${getTypeBadgeClass(facet.type)} badge-sm mr-2`}>
                    {facet.type}
                  </span>
                  <span className="text-capitalize">{facet.type}</span>
                </div>
                <span className="badge badge-secondary badge-sm">{facet.count}</span>
              </label>
            </div>
          ))
        )}
      </div>

      {selectedTypes.length > 0 && (
        <div className="mt-2">
          <small className="text-muted">
            {selectedTypes.length} type{selectedTypes.length !== 1 ? 's' : ''} selected
          </small>
        </div>
      )}
    </div>
  )
}
