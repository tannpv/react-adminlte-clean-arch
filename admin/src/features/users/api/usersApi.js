import { ApiClient } from '../../../shared/lib/apiClient'
import { computeDisplayName } from '../../../shared/lib/userDisplayName'

const normalizeProfile = (user) => {
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    dateOfBirth: user.dateOfBirth || null,
    pictureUrl: user.pictureUrl || null,
  }
}

const normalizeUser = (user) => {
  const profile = normalizeProfile(user)
  return {
    id: user.id,
    email: user.email,
    roles: Array.isArray(user.roles) ? user.roles.map(role => role.id || role) : [],
    profile,
    displayName: computeDisplayName(profile, user.email),
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    phone: user.phone,
    address: user.address,
    preferences: user.preferences,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export async function fetchUsers({ search } = {}) {
  const params = { page: 1, limit: 100 } // Get all users for now
  const trimmed = search?.trim()
  if (trimmed) params.search = trimmed

  const res = await ApiClient.get('/users', { params })
  // Handle paginated response from NestJS
  const users = res.data?.data || res.data || []
  return Array.isArray(users) ? users.map(normalizeUser) : []
}

export async function createUser(payload) {
  // Transform payload to match NestJS DTO structure
  const createPayload = {
    email: payload.email,
    firstName: payload.profile?.firstName || '',
    lastName: payload.profile?.lastName || '',
    phone: payload.phone,
    isActive: payload.isActive !== false,
    isEmailVerified: payload.isEmailVerified || false,
    dateOfBirth: payload.profile?.dateOfBirth,
    address: payload.address,
    preferences: payload.preferences,
    roleIds: payload.roles || [],
  }

  const res = await ApiClient.post('/users', createPayload)
  return normalizeUser(res.data)
}

export async function updateUser(id, payload) {
  // Transform payload to match NestJS DTO structure
  const updatePayload = {
    email: payload.email,
    firstName: payload.profile?.firstName || '',
    lastName: payload.profile?.lastName || '',
    phone: payload.phone,
    isActive: payload.isActive,
    isEmailVerified: payload.isEmailVerified,
    dateOfBirth: payload.profile?.dateOfBirth,
    address: payload.address,
    preferences: payload.preferences,
    roleIds: payload.roles || [],
  }

  const res = await ApiClient.patch(`/users/${id}`, updatePayload)
  return normalizeUser(res.data)
}

export async function deleteUser(id) {
  const res = await ApiClient.delete(`/users/${id}`)
  return { id } // NestJS returns 204 No Content, so we return the ID
}
