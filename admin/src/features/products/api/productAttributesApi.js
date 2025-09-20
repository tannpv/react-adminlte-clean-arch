import { ApiClient } from '../../../shared/lib/apiClient'

const normalizeTerm = (term) => ({
  id: term.id,
  name: term.name,
  slug: term.slug,
  order: term.order ?? 0,
  metadata: term.metadata ?? null,
})

const normalizeAttribute = (attribute) => ({
  id: attribute.id,
  name: attribute.name,
  slug: attribute.slug,
  description: attribute.description || '',
  inputType: attribute.inputType || 'select',
  terms: Array.isArray(attribute.terms) ? attribute.terms.map(normalizeTerm) : [],
})

export async function fetchProductAttributes() {
  const res = await ApiClient.get('/product-attributes')
  if (!Array.isArray(res.data)) return []
  return res.data.map(normalizeAttribute)
}

export async function createProductAttribute(payload) {
  const res = await ApiClient.post('/product-attributes', payload)
  return normalizeAttribute(res.data)
}

export async function updateProductAttribute(id, payload) {
  const res = await ApiClient.put(`/product-attributes/${id}`, payload)
  return normalizeAttribute(res.data)
}

export async function deleteProductAttribute(id) {
  const res = await ApiClient.delete(`/product-attributes/${id}`)
  return normalizeAttribute(res.data)
}

export async function createAttributeTerm(attributeId, payload) {
  const res = await ApiClient.post(`/product-attributes/${attributeId}/terms`, payload)
  return normalizeAttribute(res.data)
}

export async function updateAttributeTerm(attributeId, termId, payload) {
  const res = await ApiClient.put(`/product-attributes/${attributeId}/terms/${termId}`, payload)
  return normalizeAttribute(res.data)
}

export async function deleteAttributeTerm(attributeId, termId) {
  const res = await ApiClient.delete(`/product-attributes/${attributeId}/terms/${termId}`)
  return normalizeAttribute(res.data)
}
