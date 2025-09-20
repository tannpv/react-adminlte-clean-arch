import React, { useEffect, useMemo, useState } from 'react'

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

const PRODUCT_TYPES = [
  { value: 'simple', label: 'Simple' },
  { value: 'variable', label: 'Variable' },
]

const getError = (errors, key) => {
  const raw = errors?.[key]
  if (!raw) return null
  return typeof raw === 'string' ? raw : raw?.message || 'Invalid'
}

const findAttributeDefinition = (attributeOptions, attributeId) =>
  attributeOptions.find((attribute) => attribute.id === attributeId)

const findTermDefinition = (attributeDefinition, termId) =>
  attributeDefinition?.terms?.find((term) => term.id === termId)

const buildVariantKey = (attributeValues = []) =>
  attributeValues
    .slice()
    .sort((a, b) => a.attributeId - b.attributeId)
    .map((value) => `${value.attributeId}:${value.termId}`)
    .join('|')

const defaultVariantStatus = (productStatus) => (productStatus === 'archived' ? 'archived' : productStatus)

export function ProductForm({
  initialProduct,
  attributeOptions = [],
  attributeLoading = false,
  categoriesLoading = false,
  onSubmit,
  onCancel,
  errors = {},
  submitting = false,
  formId = 'product-form',
  categoryOptions = [],
}) {
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [status, setStatus] = useState('draft')
  const [categories, setCategories] = useState([])
  const [type, setType] = useState('simple')
  const [attributes, setAttributes] = useState([])
  const [variants, setVariants] = useState([])

  useEffect(() => {
    if (!initialProduct || !initialProduct.id) {
      setSku(initialProduct?.sku || '')
      setName(initialProduct?.name || '')
      setDescription(initialProduct?.description || '')
      setPrice(initialProduct && typeof initialProduct.price === 'number' ? String(initialProduct.price) : '')
      setCurrency(initialProduct?.currency || 'USD')
      setStatus(initialProduct?.status || 'draft')
      setCategories(Array.isArray(initialProduct?.categoryIds) ? initialProduct.categoryIds.map(String) : [])
      setType(initialProduct?.type || 'simple')
      setAttributes([])
      setVariants([])
      return
    }

    setSku(initialProduct.sku || '')
    setName(initialProduct.name || '')
    setDescription(initialProduct.description || '')
    setPrice(typeof initialProduct.price === 'number' ? String(initialProduct.price) : '')
    setCurrency(initialProduct.currency || 'USD')
    setStatus(initialProduct.status || 'draft')
    setCategories(Array.isArray(initialProduct.categoryIds) ? initialProduct.categoryIds.map(String) : [])
    setType(initialProduct.type || 'simple')

    const attributeState = Array.isArray(initialProduct.attributes)
      ? initialProduct.attributes.map((attribute) => ({
          attributeId: attribute.attributeId,
          attributeName: attribute.attributeName,
          attributeSlug: attribute.attributeSlug,
          visible: Boolean(attribute.visible),
          variation: Boolean(attribute.variation),
          selectedTermIds: Array.isArray(attribute.terms)
            ? attribute.terms.map((term) => term.termId)
            : [],
        }))
      : []
    setAttributes(attributeState)

    const variantState = Array.isArray(initialProduct.variants)
      ? initialProduct.variants.map((variant) => ({
          id: variant.id ?? null,
          sku: variant.sku || '',
          price: typeof variant.price === 'number' ? String(variant.price) : '',
          salePrice:
            variant.salePrice === null || variant.salePrice === undefined
              ? ''
              : String(variant.salePrice),
          currency: variant.currency || initialProduct.currency || 'USD',
          status: variant.status || initialProduct.status || 'draft',
          stockQuantity:
            variant.stockQuantity === null || variant.stockQuantity === undefined
              ? ''
              : String(variant.stockQuantity),
          metadata: variant.metadata ?? null,
          attributes: Array.isArray(variant.attributes)
            ? variant.attributes.map((value) => ({
                attributeId: value.attributeId,
                attributeName: value.attributeName,
                attributeSlug: value.attributeSlug,
                termId: value.termId,
                termName: value.termName,
                termSlug: value.termSlug,
              }))
            : [],
        }))
      : []

    setVariants(variantState)
  }, [initialProduct])

  const normalizedErrors = useMemo(
    () => ({
      sku: getError(errors, 'sku'),
      name: getError(errors, 'name'),
      description: getError(errors, 'description'),
      price: getError(errors, 'price'),
      currency: getError(errors, 'currency'),
      status: getError(errors, 'status'),
      categories: getError(errors, 'categories'),
      type: getError(errors, 'type'),
      attributes: getError(errors, 'attributes'),
      variants: getError(errors, 'variants'),
    }),
    [errors],
  )

  const variationAttributes = attributes.filter((attribute) => attribute.variation)

  const availableAttributeChoices = attributeOptions.filter(
    (attribute) => !attributes.some((selected) => selected.attributeId === attribute.id),
  )

  const updateVariantsForAttributeChanges = (nextAttributes) => {
    setVariants((prevVariants) =>
      prevVariants.map((variant) => {
        const nextVariationAttributes = nextAttributes.filter((attribute) => attribute.variation)
        const nextValues = []

        nextVariationAttributes.forEach((attribute) => {
          const definition = findAttributeDefinition(attributeOptions, attribute.attributeId)
          const availableTermIds = new Set(attribute.selectedTermIds)

          if (!definition) return

          const currentValue = variant.attributes.find((value) => value.attributeId === attribute.attributeId)
          if (currentValue && availableTermIds.has(currentValue.termId)) {
            nextValues.push(currentValue)
            return
          }

          if (availableTermIds.size > 0) {
            const termId = attribute.selectedTermIds[0]
            const termDefinition = findTermDefinition(definition, termId)
            if (termDefinition) {
              nextValues.push({
                attributeId: definition.id,
                attributeName: definition.name,
                attributeSlug: definition.slug,
                termId: termDefinition.id,
                termName: termDefinition.name,
                termSlug: termDefinition.slug,
              })
            }
          }
        })

        return {
          ...variant,
          attributes: nextValues,
        }
      })
    )
  }

  const handleAddAttribute = (attributeId) => {
    const definition = findAttributeDefinition(attributeOptions, attributeId)
    if (!definition) return
    const defaultTermIds = definition.terms.map((term) => term.id)
    const newAttribute = {
      attributeId: definition.id,
      attributeName: definition.name,
      attributeSlug: definition.slug,
      visible: true,
      variation: type === 'variable' && defaultTermIds.length > 0,
      selectedTermIds: defaultTermIds,
    }
    const nextAttributes = [...attributes, newAttribute]
    setAttributes(nextAttributes)
    updateVariantsForAttributeChanges(nextAttributes)
  }

  const handleRemoveAttribute = (attributeId) => {
    const nextAttributes = attributes.filter((attribute) => attribute.attributeId !== attributeId)
    setAttributes(nextAttributes)
    updateVariantsForAttributeChanges(nextAttributes)
  }

  const handleToggleAttributeTerm = (attributeId, termId) => {
    const nextAttributes = attributes.map((attribute) => {
      if (attribute.attributeId !== attributeId) return attribute
      const selectedTermIds = new Set(attribute.selectedTermIds)
      if (selectedTermIds.has(termId)) {
        selectedTermIds.delete(termId)
      } else {
        selectedTermIds.add(termId)
      }
      return {
        ...attribute,
        selectedTermIds: Array.from(selectedTermIds),
      }
    })
    setAttributes(nextAttributes)
    updateVariantsForAttributeChanges(nextAttributes)
  }

  const handleToggleAttributeFlag = (attributeId, key) => {
    const nextAttributes = attributes.map((attribute) => {
      if (attribute.attributeId !== attributeId) return attribute
      return {
        ...attribute,
        [key]: !attribute[key],
      }
    })
    setAttributes(nextAttributes)
    updateVariantsForAttributeChanges(nextAttributes)
  }

  const handleVariantFieldChange = (index, patch) => {
    setVariants((prev) =>
      prev.map((variant, idx) => (idx === index ? { ...variant, ...patch } : variant)),
    )
  }

  const handleVariantAttributeChange = (index, attributeId, termId) => {
    setVariants((prev) =>
      prev.map((variant, idx) => {
        if (idx !== index) return variant
        const definition = findAttributeDefinition(attributeOptions, attributeId)
        const termDefinition = findTermDefinition(definition, termId)
        if (!definition || !termDefinition) return variant

        const nextAttributes = variant.attributes.filter((value) => value.attributeId !== attributeId)
        if (termId) {
          nextAttributes.push({
            attributeId,
            attributeName: definition.name,
            attributeSlug: definition.slug,
            termId: termDefinition.id,
            termName: termDefinition.name,
            termSlug: termDefinition.slug,
          })
        }
        return {
          ...variant,
          attributes: nextAttributes,
        }
      }),
    )
  }

  const handleRemoveVariant = (index) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleAddVariant = () => {
    const baseCurrency = currency || 'USD'
    const baseStatus = defaultVariantStatus(status)
    const attributeValues = variationAttributes.map((attribute) => {
      const definition = findAttributeDefinition(attributeOptions, attribute.attributeId)
      const termDefinition = definition && attribute.selectedTermIds.length
        ? findTermDefinition(definition, attribute.selectedTermIds[0])
        : null
      if (!definition || !termDefinition) return null
      return {
        attributeId: definition.id,
        attributeName: definition.name,
        attributeSlug: definition.slug,
        termId: termDefinition.id,
        termName: termDefinition.name,
        termSlug: termDefinition.slug,
      }
    }).filter(Boolean)

    setVariants((prev) => [
      ...prev,
      {
        id: null,
        sku: '',
        price: '',
        salePrice: '',
        currency: baseCurrency,
        status: baseStatus,
        stockQuantity: '',
        metadata: null,
        attributes: attributeValues,
      },
    ])
  }

  const generateVariants = () => {
    const variationAttributesCurrent = attributes.filter(
      (attribute) => attribute.variation && attribute.selectedTermIds.length,
    )
    if (!variationAttributesCurrent.length) return

    const combinations = variationAttributesCurrent.reduce(
      (acc, attribute) => {
        const definition = findAttributeDefinition(attributeOptions, attribute.attributeId)
        if (!definition) return acc
        const terms = attribute.selectedTermIds
          .map((termId) => findTermDefinition(definition, termId))
          .filter(Boolean)
        if (!terms.length) return acc

        if (!acc.length) {
          return terms.map((term) => [{
            attributeId: definition.id,
            attributeName: definition.name,
            attributeSlug: definition.slug,
            termId: term.id,
            termName: term.name,
            termSlug: term.slug,
          }])
        }

        const next = []
        acc.forEach((combo) => {
          terms.forEach((term) => {
            next.push([
              ...combo,
              {
                attributeId: definition.id,
                attributeName: definition.name,
                attributeSlug: definition.slug,
                termId: term.id,
                termName: term.name,
                termSlug: term.slug,
              },
            ])
          })
        })
        return next
      },
      [],
    )

    if (!combinations.length) return

    const existingMap = new Map()
    variants.forEach((variant) => {
      existingMap.set(buildVariantKey(variant.attributes), variant)
    })

    const baseCurrency = currency || 'USD'
    const baseStatus = defaultVariantStatus(status)

    const nextVariants = combinations.map((attributesCombo, index) => {
      const key = buildVariantKey(attributesCombo)
      const existing = existingMap.get(key)
      if (existing) {
        return existing
      }
      return {
        id: null,
        sku: '',
        price: '',
        salePrice: '',
        currency: baseCurrency,
        status: baseStatus,
        stockQuantity: '',
        metadata: null,
        attributes: attributesCombo,
      }
    })

    setVariants(nextVariants)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const preparedAttributes = attributes.map((attribute) => {
      const definition = findAttributeDefinition(attributeOptions, attribute.attributeId)
      const terms = attribute.selectedTermIds
        .map((termId) => findTermDefinition(definition, termId))
        .filter(Boolean)
        .map((term) => ({
          termId: term.id,
          termName: term.name,
          termSlug: term.slug,
        }))
      return {
        attributeId: attribute.attributeId,
        attributeName: attribute.attributeName,
        attributeSlug: attribute.attributeSlug,
        visible: attribute.visible,
        variation: attribute.variation,
        terms,
      }
    })

    const preparedVariants = type === 'variable'
      ? variants.map((variant) => ({
          ...variant,
          attributes: variant.attributes,
        }))
      : []

    const values = {
      sku,
      name,
      description,
      price,
      currency,
      status,
      categoryIds: categories,
      type,
      attributes: preparedAttributes,
      variants: preparedVariants,
    }

    onSubmit(values)
  }

  const showVariantTools = type === 'variable'

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group col-md-6">
          <label>SKU</label>
          <input
            className={`form-control ${normalizedErrors.sku ? 'is-invalid' : ''}`}
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
            disabled={submitting}
          />
          {normalizedErrors.sku && <div className="invalid-feedback">{normalizedErrors.sku}</div>}
        </div>
        <div className="form-group col-md-6">
          <label>Name</label>
          <input
            className={`form-control ${normalizedErrors.name ? 'is-invalid' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={submitting}
          />
          {normalizedErrors.name && <div className="invalid-feedback">{normalizedErrors.name}</div>}
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          className={`form-control ${normalizedErrors.description ? 'is-invalid' : ''}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={submitting}
        />
        {normalizedErrors.description && <div className="invalid-feedback">{normalizedErrors.description}</div>}
      </div>

      <div className="form-row">
        <div className="form-group col-md-4">
          <label>Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`form-control ${normalizedErrors.price ? 'is-invalid' : ''}`}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            disabled={submitting}
          />
          {normalizedErrors.price && <div className="invalid-feedback">{normalizedErrors.price}</div>}
        </div>
        <div className="form-group col-md-4">
          <label>Currency</label>
          <input
            className={`form-control ${normalizedErrors.currency ? 'is-invalid' : ''}`}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
            disabled={submitting}
          />
          {normalizedErrors.currency && <div className="invalid-feedback">{normalizedErrors.currency}</div>}
        </div>
        <div className="form-group col-md-4">
          <label>Status</label>
          <select
            className={`form-control ${normalizedErrors.status ? 'is-invalid' : ''}`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={submitting}
          >
            {STATUSES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          {normalizedErrors.status && <div className="invalid-feedback">{normalizedErrors.status}</div>}
        </div>
      </div>

      <div className="form-group">
        <label>Product Type</label>
        <select
          className={`form-control ${normalizedErrors.type ? 'is-invalid' : ''}`}
          value={type}
          onChange={(e) => {
            const nextType = e.target.value
            setType(nextType)
            if (nextType === 'simple') {
              setVariants([])
              setAttributes((prev) => prev.map((attribute) => ({ ...attribute, variation: false })))
            }
          }}
          disabled={submitting}
        >
          {PRODUCT_TYPES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        {normalizedErrors.type && <div className="invalid-feedback">{normalizedErrors.type}</div>}
      </div>

      <div className="form-group">
        <label>Categories</label>
        <select
          multiple
          className={`form-control ${normalizedErrors.categories ? 'is-invalid' : ''}`}
          value={categories}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions).map((opt) => opt.value)
            setCategories(values)
          }}
          size={Math.min(8, Math.max(3, categoryOptions.length || 3))}
          disabled={submitting || categoriesLoading}
        >
          {categoryOptions.map((category) => (
            <option key={category.id} value={String(category.id)}>{category.name}</option>
          ))}
        </select>
        {categoriesLoading && (
          <small className="form-text text-muted">Loading categories…</small>
        )}
        {!categoriesLoading && !categoryOptions.length && (
          <small className="form-text text-muted">No categories available. Create categories first.</small>
        )}
        {normalizedErrors.categories && <div className="invalid-feedback">{normalizedErrors.categories}</div>}
      </div>

      <hr />
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Attributes</h5>
          <div>
            <div className="form-inline">
              <label className="mr-2 mb-0">Add attribute:</label>
              <select
                className="form-control mr-2"
                value=""
                onChange={(e) => {
                  const attributeId = Number(e.target.value)
                  if (Number.isFinite(attributeId)) {
                    handleAddAttribute(attributeId)
                  }
                }}
                disabled={submitting || attributeLoading || !availableAttributeChoices.length}
              >
                <option value="">Select attribute</option>
                {availableAttributeChoices.map((attribute) => (
                  <option key={attribute.id} value={attribute.id}>{attribute.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {attributeLoading && <div className="text-muted mt-2">Loading attributes…</div>}
        {normalizedErrors.attributes && (
          <div className="alert alert-danger mt-3" role="alert">
            {normalizedErrors.attributes}
          </div>
        )}
        <div className="mt-3">
          {attributes.length === 0 && (
            <p className="text-muted mb-0">No attributes selected.</p>
          )}
          {attributes.map((attribute) => {
            const definition = findAttributeDefinition(attributeOptions, attribute.attributeId)
            return (
              <div key={attribute.attributeId} className="card mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <strong>{attribute.attributeName}</strong>
                  <div>
                    <div className="form-check form-check-inline mr-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`visible-${attribute.attributeId}`}
                        checked={attribute.visible}
                        onChange={() => handleToggleAttributeFlag(attribute.attributeId, 'visible')}
                        disabled={submitting}
                      />
                      <label className="form-check-label" htmlFor={`visible-${attribute.attributeId}`}>Visible</label>
                    </div>
                    <div className="form-check form-check-inline mr-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`variation-${attribute.attributeId}`}
                        checked={attribute.variation}
                        onChange={() => handleToggleAttributeFlag(attribute.attributeId, 'variation')}
                        disabled={submitting || type === 'simple'}
                      />
                      <label className="form-check-label" htmlFor={`variation-${attribute.attributeId}`}>
                        Used for variations
                      </label>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemoveAttribute(attribute.attributeId)}
                      disabled={submitting}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  {definition && definition.terms.length ? (
                    <div className="d-flex flex-wrap">
                      {definition.terms.map((term) => (
                        <div key={term.id} className="custom-control custom-checkbox mr-4 mb-2">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={`attr-${attribute.attributeId}-term-${term.id}`}
                            checked={attribute.selectedTermIds.includes(term.id)}
                            onChange={() => handleToggleAttributeTerm(attribute.attributeId, term.id)}
                            disabled={submitting}
                          />
                          <label className="custom-control-label" htmlFor={`attr-${attribute.attributeId}-term-${term.id}`}>
                            {term.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0">This attribute has no terms.</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showVariantTools && (
        <>
          <hr />
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Variants</h5>
            <div>
              <button
                type="button"
                className="btn btn-outline-secondary mr-2"
                onClick={generateVariants}
                disabled={submitting || !variationAttributes.length}
              >
                Generate Variants
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleAddVariant}
                disabled={submitting}
              >
                Add Variant
              </button>
            </div>
          </div>
          {normalizedErrors.variants && (
            <div className="alert alert-danger" role="alert">{normalizedErrors.variants}</div>
          )}
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th style={{ width: 120 }}>Price</th>
                  <th style={{ width: 120 }}>Sale Price</th>
                  <th style={{ width: 100 }}>Currency</th>
                  <th>Status</th>
                  <th style={{ width: 100 }}>Stock</th>
                  {variationAttributes.map((attribute) => (
                    <th key={`variant-attr-${attribute.attributeId}`}>{attribute.attributeName}</th>
                  ))}
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {variants.length === 0 && (
                  <tr>
                    <td colSpan={6 + variationAttributes.length} className="text-center text-muted">
                      No variants defined.
                    </td>
                  </tr>
                )}
                {variants.map((variant, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        value={variant.sku}
                        onChange={(e) => handleVariantFieldChange(index, { sku: e.target.value })}
                        disabled={submitting}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control form-control-sm"
                        value={variant.price}
                        onChange={(e) => handleVariantFieldChange(index, { price: e.target.value })}
                        disabled={submitting}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control form-control-sm"
                        value={variant.salePrice}
                        onChange={(e) => handleVariantFieldChange(index, { salePrice: e.target.value })}
                        disabled={submitting}
                      />
                    </td>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        value={variant.currency}
                        onChange={(e) => handleVariantFieldChange(index, { currency: e.target.value })}
                        disabled={submitting}
                      />
                    </td>
                    <td>
                      <select
                        className="form-control form-control-sm"
                        value={variant.status}
                        onChange={(e) => handleVariantFieldChange(index, { status: e.target.value })}
                        disabled={submitting}
                      >
                        {STATUSES.map((item) => (
                          <option key={`variant-status-${item.value}`} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={variant.stockQuantity}
                        onChange={(e) => handleVariantFieldChange(index, { stockQuantity: e.target.value })}
                        disabled={submitting}
                      />
                    </td>
                    {variationAttributes.map((attribute) => {
                      const definition = findAttributeDefinition(attributeOptions, attribute.attributeId)
                      const selectedIds = attribute.selectedTermIds
                      const currentValue = variant.attributes.find((value) => value.attributeId === attribute.attributeId)
                      return (
                        <td key={`variant-${index}-attr-${attribute.attributeId}`}>
                          <select
                            className="form-control form-control-sm"
                            value={currentValue ? currentValue.termId : ''}
                            onChange={(e) => handleVariantAttributeChange(index, attribute.attributeId, Number(e.target.value))}
                            disabled={submitting || !definition}
                          >
                            <option value="">Select {attribute.attributeName}</option>
                            {definition && definition.terms
                              .filter((term) => selectedIds.includes(term.id))
                              .map((term) => (
                                <option key={term.id} value={term.id}>{term.name}</option>
                              ))}
                          </select>
                        </td>
                      )
                    })}
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveVariant(index)}
                        disabled={submitting}
                        title="Remove variant"
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="d-flex justify-content-end">
        <button type="button" className="btn btn-secondary mr-2" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : (initialProduct?.id ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  )
}
