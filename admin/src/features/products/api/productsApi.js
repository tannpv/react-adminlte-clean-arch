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
  type: product.type || 'simple',
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
})

export async function fetchProducts({ search } = {}) {
  const params = {}
  const trimmed = search?.trim()
  if (trimmed) params.search = trimmed

  const res = await ApiClient.get('/products', { params })
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

export async function fetchProductAttributeValues(productId) {
  const res = await ApiClient.get(`/products/${productId}/attribute-values`)
  return res.data || []
}