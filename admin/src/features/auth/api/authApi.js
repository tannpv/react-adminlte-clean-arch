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

export async function login(credentials) {
  const res = await ApiClient.post('/auth/login', credentials)
  const { token, user, expiresIn } = res.data || {}
  return { token, user: normalizeUser(user || {}), expiresIn }
}

export async function register(payload) {
  const res = await ApiClient.post('/auth/register', payload)
  const { token, user, expiresIn } = res.data || {}
  return { token, user: normalizeUser(user || {}), expiresIn }
}

export async function getProfile() {
  const res = await ApiClient.get('/auth/profile')
  return normalizeUser(res.data || {})
}

export async function refreshToken() {
  const res = await ApiClient.post('/auth/refresh')
  const { token, user, expiresIn } = res.data || {}
  return { token, user: normalizeUser(user || {}), expiresIn }
}

export async function logout() {
  const res = await ApiClient.post('/auth/logout')
  return res.data
}
