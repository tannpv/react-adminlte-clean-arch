import { ApiClient } from '../../../shared/lib/apiClient'

const normalizeCategory = (category) => ({
  id: category.id,
  name: category.name,
})

export async function fetchCategories() {
  const res = await ApiClient.get('/categories')
  return Array.isArray(res.data) ? res.data.map(normalizeCategory) : []
}

export async function createCategory(payload) {
  const res = await ApiClient.post('/categories', payload)
  return normalizeCategory(res.data)
}

export async function updateCategory(id, payload) {
  const res = await ApiClient.put(`/categories/${id}`, payload)
  return normalizeCategory(res.data)
}

export async function deleteCategory(id) {
  const res = await ApiClient.delete(`/categories/${id}`)
  return normalizeCategory(res.data)
}

