import React from 'react'

export function StatusFilter({
  selectedStatuses,
  onStatusChange,
  facets,
  isLoading
}) {
  const handleStatusToggle = (status) => {
    const newSelection = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status]
    
    onStatusChange(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedStatuses.length === facets.length) {
      onStatusChange([])
    } else {
      onStatusChange(facets.map(facet => facet.status))
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'published':
        return 'badge-success'
      case 'draft':
        return 'badge-warning'
      case 'archived':
        return 'badge-secondary'
      default:
        return 'badge-light'
    }
  }

  return (
    <div className="status-filter">
      <div className="mb-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={handleSelectAll}
          disabled={isLoading}
        >
          {selectedStatuses.length === facets.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="status-list">
        {facets.length === 0 ? (
          <div className="text-muted text-center py-2">
            <small>No statuses found</small>
          </div>
        ) : (
          facets.map(facet => (
            <div key={facet.status} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`status-${facet.status}`}
                checked={selectedStatuses.includes(facet.status)}
                onChange={() => handleStatusToggle(facet.status)}
                disabled={isLoading}
              />
              <label className="form-check-label d-flex justify-content-between w-100" htmlFor={`status-${facet.status}`}>
                <div className="d-flex align-items-center">
                  <span className={`badge ${getStatusBadgeClass(facet.status)} badge-sm mr-2`}>
                    {facet.status}
                  </span>
                  <span className="text-capitalize">{facet.status}</span>
                </div>
                <span className="badge badge-secondary badge-sm">{facet.count}</span>
              </label>
            </div>
          ))
        )}
      </div>

      {selectedStatuses.length > 0 && (
        <div className="mt-2">
          <small className="text-muted">
            {selectedStatuses.length} status{selectedStatuses.length !== 1 ? 'es' : ''} selected
          </small>
        </div>
      )}
    </div>
  )
}
