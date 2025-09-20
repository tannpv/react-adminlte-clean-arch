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
