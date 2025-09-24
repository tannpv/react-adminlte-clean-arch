import React, { useState, useEffect } from 'react'

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onPriceChange,
  priceRange,
  isLoading
}) {
  const [localMinPrice, setLocalMinPrice] = useState(minPrice || '')
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice || '')

  useEffect(() => {
    setLocalMinPrice(minPrice || '')
  }, [minPrice])

  useEffect(() => {
    setLocalMaxPrice(maxPrice || '')
  }, [maxPrice])

  const handleMinPriceChange = (e) => {
    const value = e.target.value
    setLocalMinPrice(value)
    
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      onPriceChange(value === '' ? undefined : parseFloat(value), maxPrice)
    }
  }

  const handleMaxPriceChange = (e) => {
    const value = e.target.value
    setLocalMaxPrice(value)
    
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      onPriceChange(minPrice, value === '' ? undefined : parseFloat(value))
    }
  }

  const handleClearPrices = () => {
    setLocalMinPrice('')
    setLocalMaxPrice('')
    onPriceChange(undefined, undefined)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined

  return (
    <div className="price-range-filter">
      <div className="mb-2">
        <small className="text-muted">
          {priceRange && (
            <span>
              Range: {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
            </span>
          )}
        </small>
      </div>

      <div className="row">
        <div className="col-6">
          <label className="form-label small">Min Price</label>
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="0.00"
            value={localMinPrice}
            onChange={handleMinPriceChange}
            min="0"
            step="0.01"
            disabled={isLoading}
          />
        </div>
        <div className="col-6">
          <label className="form-label small">Max Price</label>
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="No limit"
            value={localMaxPrice}
            onChange={handleMaxPriceChange}
            min="0"
            step="0.01"
            disabled={isLoading}
          />
        </div>
      </div>

      {hasPriceFilter && (
        <div className="mt-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleClearPrices}
            disabled={isLoading}
          >
            Clear Price Filter
          </button>
        </div>
      )}

      {hasPriceFilter && (
        <div className="mt-2">
          <small className="text-muted">
            Filter: {formatPrice(minPrice || 0)} - {maxPrice ? formatPrice(maxPrice) : '∞'}
          </small>
        </div>
      )}

      {/* Price Range Presets */}
      {priceRange && (
        <div className="mt-3">
          <small className="text-muted d-block mb-2">Quick filters:</small>
          <div className="d-flex flex-wrap gap-1">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => onPriceChange(undefined, 50)}
              disabled={isLoading}
            >
              Under $50
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => onPriceChange(50, 100)}
              disabled={isLoading}
            >
              $50 - $100
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => onPriceChange(100, 500)}
              disabled={isLoading}
            >
              $100 - $500
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => onPriceChange(500, undefined)}
              disabled={isLoading}
            >
              Over $500
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
