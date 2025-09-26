export function computeDisplayName(profile, fallbackEmail = '') {
  if (profile) {
    const first = profile.firstName ? profile.firstName.trim() : ''
    const last = profile.lastName ? profile.lastName.trim() : ''
    const parts = [first, last].filter(Boolean)
    if (parts.length) return parts.join(' ')
  }
  return (fallbackEmail || '').trim()
}

export function getUserDisplayName(user) {
  if (!user) return ''
  if (typeof user.displayName === 'string' && user.displayName.trim()) {
    return user.displayName.trim()
  }
  return computeDisplayName(user.profile, user.email)
}

