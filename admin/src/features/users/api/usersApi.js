import { ApiClient } from '../../../shared/lib/apiClient'

const normalizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  roles: Array.isArray(user.roles) ? user.roles : [],
})

export async function fetchUsers() {
  const res = await ApiClient.get('/users')
  return Array.isArray(res.data) ? res.data.map(normalizeUser) : []
}

export async function createUser(payload) {
  const res = await ApiClient.post('/users', payload)
  return normalizeUser(res.data)
}

export async function updateUser(id, payload) {
  const res = await ApiClient.put(`/users/${id}`, payload)
  return normalizeUser(res.data)
}

export async function deleteUser(id) {
  const res = await ApiClient.delete(`/users/${id}`)
  return normalizeUser(res.data)
}
