const centsToPrice = (value) => (typeof value === 'number' ? value / 100 : 0)
const priceToCents = (value) => {
  if (value === null || value === undefined || value === '') return null
  const number = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(number)) return null
  return Math.round(number * 100)
}

export function deserializeProduct(product) {
  if (!product) return null
  return {
    ...product,
    price: centsToPrice(product.priceCents),
    attributeSetId: product.attributeSetId ?? null,
    attributes: Array.isArray(product.attributes)
      ? product.attributes.map((attribute) => ({
          ...attribute,
          terms: Array.isArray(attribute.terms)
            ? attribute.terms.map((term) => ({ ...term }))
            : [],
        }))
      : [],
    variants: Array.isArray(product.variants)
      ? product.variants.map((variant) => ({
          ...variant,
          price: centsToPrice(variant.priceCents),
          salePrice:
            variant.salePriceCents === null || variant.salePriceCents === undefined
              ? null
              : centsToPrice(variant.salePriceCents),
          attributes: Array.isArray(variant.attributes)
            ? variant.attributes.map((value) => ({ ...value }))
            : [],
        }))
      : [],
  }
}

const normalizeAttributePayload = (attribute) => {
  if (!attribute) return null
  const attributeId = Number(attribute.attributeId)
  if (!Number.isFinite(attributeId)) return null
  return {
    attributeId,
    attributeName: typeof attribute.attributeName === 'string' ? attribute.attributeName.trim() : '',
    attributeSlug: typeof attribute.attributeSlug === 'string' ? attribute.attributeSlug.trim() : '',
    visible: Boolean(attribute.visible),
    variation: Boolean(attribute.variation),
    terms: Array.isArray(attribute.terms)
      ? attribute.terms
          .map((term) => {
            const termId = Number(term.termId)
            if (!Number.isFinite(termId)) return null
            return {
              termId,
              termName: typeof term.termName === 'string' ? term.termName.trim() : '',
              termSlug: typeof term.termSlug === 'string' ? term.termSlug.trim() : '',
            }
          })
          .filter(Boolean)
      : [],
  }
}

const normalizeVariantPayload = (variant, defaultCurrency) => {
  if (!variant) return null
  const price = Number(variant.price ?? 0)
  const sku = typeof variant.sku === 'string' ? variant.sku.trim() : ''
  if (!sku) return null
  return {
    id: variant.id ?? undefined,
    sku,
    price,
    salePrice:
      variant.salePrice === null || variant.salePrice === undefined || variant.salePrice === ''
        ? null
        : Number(variant.salePrice),
    currency:
      typeof variant.currency === 'string' && variant.currency.trim()
        ? variant.currency.trim().toUpperCase()
        : defaultCurrency,
    status: variant.status,
    stockQuantity:
      variant.stockQuantity === null || variant.stockQuantity === undefined || variant.stockQuantity === ''
        ? null
        : Number(variant.stockQuantity),
    metadata: variant.metadata ?? null,
    attributes: Array.isArray(variant.attributes)
      ? variant.attributes
          .map((value) => {
            const attributeId = Number(value.attributeId)
            const termId = Number(value.termId)
            if (!Number.isFinite(attributeId) || !Number.isFinite(termId)) return null
            return {
              attributeId,
              attributeName: typeof value.attributeName === 'string' ? value.attributeName.trim() : '',
              attributeSlug: typeof value.attributeSlug === 'string' ? value.attributeSlug.trim() : '',
              termId,
              termName: typeof value.termName === 'string' ? value.termName.trim() : '',
              termSlug: typeof value.termSlug === 'string' ? value.termSlug.trim() : '',
            }
          })
          .filter(Boolean)
      : [],
  }
}

export function serializeProductPayload(values) {
  if (!values) return values
  const type = values.type || 'simple'
  const baseCurrency =
    typeof values.currency === 'string' && values.currency.trim()
      ? values.currency.trim().toUpperCase()
      : 'USD'

  const payload = {
    sku: typeof values.sku === 'string' ? values.sku.trim() : '',
    name: typeof values.name === 'string' ? values.name.trim() : '',
    description: values.description ?? null,
    price: Number(values.price ?? 0),
    currency: baseCurrency,
    status: values.status,
    metadata: values.metadata ?? null,
    categories: Array.isArray(values.categoryIds)
      ? values.categoryIds.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [],
    type,
    attributeSetId:
      values.attributeSetId === null || values.attributeSetId === undefined || values.attributeSetId === ''
        ? undefined
        : Number(values.attributeSetId),
  }

  if (values.attributes) {
    payload.attributes = values.attributes
      .map(normalizeAttributePayload)
      .filter((attribute) => attribute && attribute.attributeId)
  }

  if (type === 'variable') {
    payload.variants = Array.isArray(values.variants)
      ? values.variants
          .map((variant) => normalizeVariantPayload(variant, baseCurrency))
          .filter((variant) => variant && variant.sku)
      : []
  }

  if (type === 'simple') {
    payload.variants = []
  }

  return payload
}
