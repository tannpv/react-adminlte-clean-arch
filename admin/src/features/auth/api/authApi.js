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

export async function login(credentials) {
  const res = await ApiClient.post('/auth/login', credentials)
  const { token, user } = res.data || {}
  return { token, user: normalizeUser(user || {}) }
}

export async function register(payload) {
  const res = await ApiClient.post('/auth/register', payload)
  const { token, user } = res.data || {}
  return { token, user: normalizeUser(user || {}) }
}
