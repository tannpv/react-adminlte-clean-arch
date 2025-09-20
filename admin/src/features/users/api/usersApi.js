import { ApiClient } from '../../../shared/lib/apiClient'
import { computeDisplayName } from '../../../shared/lib/userDisplayName'

const normalizeProfile = (profile) => {
  if (!profile) return null
  return {
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    dateOfBirth: profile.dateOfBirth || null,
    pictureUrl: profile.pictureUrl || null,
  }
}

const normalizeUser = (user) => {
  const profile = normalizeProfile(user.profile)
  return {
    id: user.id,
    email: user.email,
    roles: Array.isArray(user.roles) ? user.roles : [],
    profile,
    displayName: computeDisplayName(profile, user.email),
  }
}

export async function fetchUsers({ search } = {}) {
  const params = {}
  const trimmed = search?.trim()
  if (trimmed) params.search = trimmed

  const res = await ApiClient.get('/users', { params })
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
