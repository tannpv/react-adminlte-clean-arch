import { ApiClient } from '../../../shared/lib/apiClient'

const normalizeRole = (role) => ({
  id: role.id,
  name: role.name,
  description: role.description,
  permissions: Array.isArray(role.permissions) ? [...role.permissions] : [],
  isActive: role.isActive,
  metadata: role.metadata,
  createdAt: role.createdAt,
  updatedAt: role.updatedAt,
})

export async function fetchRoles() {
  const res = await ApiClient.get('/roles', { params: { page: 1, limit: 100 } })
  // Handle paginated response from NestJS
  const roles = res.data?.data || res.data || []
  return Array.isArray(roles) ? roles.map(normalizeRole) : []
}

export async function createRole(payload) {
  const res = await ApiClient.post('/roles', payload)
  return normalizeRole(res.data)
}

export async function updateRole(id, payload) {
  const res = await ApiClient.patch(`/roles/${id}`, payload)
  return normalizeRole(res.data)
}

export async function deleteRole(id) {
  const res = await ApiClient.delete(`/roles/${id}`)
  return { id } // NestJS returns 204 No Content, so we return the ID
}
