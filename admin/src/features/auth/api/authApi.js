import { ApiClient } from '../../../shared/lib/apiClient'

const normalizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  roles: Array.isArray(user.roles) ? user.roles : [],
})

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
