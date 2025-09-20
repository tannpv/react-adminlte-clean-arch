import { ApiClient } from '../../../shared/lib/apiClient'

const normalizeCategory = (category) => ({
  id: category.id,
  name: category.name,
  parentId: category.parentId ?? null,
  parentName: category.parentName ?? null,
})

export async function fetchCategories() {
  const res = await ApiClient.get('/categories')
  if (!res?.data) return { categories: [], hierarchy: [] }

  if (Array.isArray(res.data)) {
    return { categories: res.data.map(normalizeCategory), hierarchy: [] }
  }

  const categories = Array.isArray(res.data.categories) ? res.data.categories.map(normalizeCategory) : []
  const hierarchy = Array.isArray(res.data.hierarchy) ? res.data.hierarchy : []
  return { categories, hierarchy }
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
