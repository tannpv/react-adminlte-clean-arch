import React, { useState } from 'react'

export function AttributeFilter({
  selectedAttributes,
  selectedAttributeValues,
  onAttributeChange,
  onAttributeValueChange,
  facets,
  isLoading
}) {
  const [expandedAttributes, setExpandedAttributes] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFacets = facets.filter(facet =>
    facet.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleAttribute = (attributeId) => {
    const newExpanded = new Set(expandedAttributes)
    if (newExpanded.has(attributeId)) {
      newExpanded.delete(attributeId)
    } else {
      newExpanded.add(attributeId)
    }
    setExpandedAttributes(newExpanded)
  }

  const handleAttributeToggle = (attributeId) => {
    const newSelection = selectedAttributes.includes(attributeId)
      ? selectedAttributes.filter(id => id !== attributeId)
      : [...selectedAttributes, attributeId]
    
    onAttributeChange(newSelection)
  }

  const handleAttributeValueToggle = (valueId) => {
    const newSelection = selectedAttributeValues.includes(valueId)
      ? selectedAttributeValues.filter(id => id !== valueId)
      : [...selectedAttributeValues, valueId]
    
    onAttributeValueChange(newSelection)
  }

  const handleSelectAllValues = (attribute) => {
    const attributeValueIds = attribute.values.map(v => v.id)
    const allSelected = attributeValueIds.every(id => selectedAttributeValues.includes(id))
    
    if (allSelected) {
      // Deselect all values for this attribute
      const newSelection = selectedAttributeValues.filter(id => !attributeValueIds.includes(id))
      onAttributeValueChange(newSelection)
    } else {
      // Select all values for this attribute
      const newSelection = [...new Set([...selectedAttributeValues, ...attributeValueIds])]
      onAttributeValueChange(newSelection)
    }
  }

  return (
    <div className="attribute-filter">
      <div className="mb-2">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Search attributes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="attribute-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {filteredFacets.length === 0 ? (
          <div className="text-muted text-center py-2">
            <small>No attributes found</small>
          </div>
        ) : (
          filteredFacets.map(attribute => (
            <div key={attribute.id} className="attribute-item mb-3">
              <div className="d-flex align-items-center">
                <input
                  className="form-check-input mr-2"
                  type="checkbox"
                  id={`attribute-${attribute.id}`}
                  checked={selectedAttributes.includes(attribute.id)}
                  onChange={() => handleAttributeToggle(attribute.id)}
                  disabled={isLoading}
                />
                <label
                  className="form-check-label flex-grow-1 d-flex justify-content-between align-items-center cursor-pointer"
                  htmlFor={`attribute-${attribute.id}`}
                >
                  <span>{attribute.name}</span>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge badge-secondary badge-sm">
                      {attribute.values.reduce((sum, v) => sum + v.count, 0)}
                    </span>
                    <i
                      className={`fas fa-chevron-${expandedAttributes.has(attribute.id) ? 'down' : 'right'} cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleAttribute(attribute.id)
                      }}
                    ></i>
                  </div>
                </label>
              </div>

              {expandedAttributes.has(attribute.id) && (
                <div className="attribute-values ml-4 mt-2">
                  <div className="mb-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleSelectAllValues(attribute)}
                      disabled={isLoading}
                    >
                      Select All Values
                    </button>
                  </div>
                  
                  <div className="values-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {attribute.values.map(value => (
                      <div key={value.id} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`value-${value.id}`}
                          checked={selectedAttributeValues.includes(value.id)}
                          onChange={() => handleAttributeValueToggle(value.id)}
                          disabled={isLoading}
                        />
                        <label className="form-check-label d-flex justify-content-between w-100" htmlFor={`value-${value.id}`}>
                          <span>{value.value}</span>
                          <span className="badge badge-light badge-sm">{value.count}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {(selectedAttributes.length > 0 || selectedAttributeValues.length > 0) && (
        <div className="mt-2">
          <small className="text-muted">
            {selectedAttributes.length} attribute{selectedAttributes.length !== 1 ? 's' : ''} selected
            {selectedAttributeValues.length > 0 && (
              <span>, {selectedAttributeValues.length} value{selectedAttributeValues.length !== 1 ? 's' : ''} selected</span>
            )}
          </small>
        </div>
      )}
    </div>
  )
}
