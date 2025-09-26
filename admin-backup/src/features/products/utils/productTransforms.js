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
  }
}

export function serializeProductPayload(values) {
  if (!values) return values
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
    type: values.type || 'simple',
    attributeValues: values.attributeValues || {},
  }

  return payload
}