import { ApiClient } from '../../../shared/lib/apiClient'

const normalizeProduct = (product) => ({
  id: product.id,
  sku: product.sku,
  name: product.name,
  description: product.description || '',
  priceCents: product.priceCents,
  currency: product.currency,
  status: product.status,
  metadata: product.metadata || null,
  categories: Array.isArray(product.categories) ? product.categories.map((c) => ({ id: c.id, name: c.name })) : [],
  categoryIds: Array.isArray(product.categories) ? product.categories.map((c) => c.id) : [],
  attributeSetId: product.attributeSetId ?? null,
  type: product.type || 'simple',
  attributes: Array.isArray(product.attributes) ? product.attributes.map((attr) => ({
    attributeId: attr.attributeId,
    attributeName: attr.attributeName,
    attributeSlug: attr.attributeSlug,
    visible: !!attr.visible,
    variation: !!attr.variation,
    terms: Array.isArray(attr.terms)
      ? attr.terms.map((term) => ({
          termId: term.termId,
          termName: term.termName,
          termSlug: term.termSlug,
        }))
      : [],
  })) : [],
  variants: Array.isArray(product.variants) ? product.variants.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    priceCents: variant.priceCents,
    salePriceCents: variant.salePriceCents,
    currency: variant.currency,
    status: variant.status,
    stockQuantity: variant.stockQuantity,
    metadata: variant.metadata || null,
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
    createdAt: variant.createdAt,
    updatedAt: variant.updatedAt,
  })) : [],
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
})

export async function fetchProducts() {
  const res = await ApiClient.get('/products')
  if (!Array.isArray(res.data)) return []
  return res.data.map(normalizeProduct)
}

export async function createProduct(payload) {
  const res = await ApiClient.post('/products', payload)
  return normalizeProduct(res.data)
}

export async function updateProduct(id, payload) {
  const res = await ApiClient.put(`/products/${id}`, payload)
  return normalizeProduct(res.data)
}

export async function deleteProduct(id) {
  const res = await ApiClient.delete(`/products/${id}`)
  return normalizeProduct(res.data)
}
