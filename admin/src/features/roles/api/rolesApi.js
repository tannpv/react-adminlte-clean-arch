import { ApiClient } from '../../../shared/lib/apiClient'

const normalizeRole = (role) => ({
  id: role.id,
  name: role.name,
})

export async function fetchRoles() {
  const res = await ApiClient.get('/roles')
  return Array.isArray(res.data) ? res.data.map(normalizeRole) : []
}

export async function createRole(payload) {
  const res = await ApiClient.post('/roles', payload)
  return normalizeRole(res.data)
}

export async function updateRole(id, payload) {
  const res = await ApiClient.put(`/roles/${id}`, payload)
  return normalizeRole(res.data)
}

export async function deleteRole(id) {
  const res = await ApiClient.delete(`/roles/${id}`)
  return normalizeRole(res.data)
}
