export const PERMISSION_GROUPS = [
  {
    entity: 'users',
    label: 'Users',
    actions: [
      { key: 'users:read', label: 'View' },
      { key: 'users:create', label: 'Add' },
      { key: 'users:update', label: 'Edit' },
      { key: 'users:delete', label: 'Delete' },
    ],
  },
  {
    entity: 'roles',
    label: 'Roles',
    actions: [
      { key: 'roles:read', label: 'View' },
      { key: 'roles:create', label: 'Add' },
      { key: 'roles:update', label: 'Edit' },
      { key: 'roles:delete', label: 'Delete' },
    ],
  },
  {
    entity: 'products',
    label: 'Products',
    actions: [
      { key: 'products:read', label: 'View' },
      { key: 'products:create', label: 'Add' },
      { key: 'products:update', label: 'Edit' },
      { key: 'products:delete', label: 'Delete' },
    ],
  },
  {
    entity: 'categories',
    label: 'Categories',
    actions: [
      { key: 'categories:read', label: 'View' },
      { key: 'categories:create', label: 'Add' },
      { key: 'categories:update', label: 'Edit' },
      { key: 'categories:delete', label: 'Delete' },
    ],
  },
]

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((group) => group.actions.map((action) => action.key))

export function groupPermissions(permissions) {
  const set = new Set(permissions || [])
  return PERMISSION_GROUPS.map((group) => ({
    ...group,
    actions: group.actions.map((action) => ({
      ...action,
      selected: set.has(action.key),
    })),
  }))
}

export function formatPermissionsForDisplay(permissions) {
  const grouped = groupPermissions(permissions)
  const knownDescriptions = grouped
    .map((group) => {
      const selectedActions = group.actions.filter((action) => action.selected)
      if (!selectedActions.length) return null
      const actionLabels = selectedActions.map((action) => action.label).join(', ')
      return `${group.label}: ${actionLabels}`
    })
    .filter(Boolean)

  const knownSet = new Set(ALL_PERMISSIONS)
  const extras = (permissions || []).filter((perm) => !knownSet.has(perm))
  if (extras.length) {
    knownDescriptions.push(`Other: ${extras.join(', ')}`)
  }

  return knownDescriptions
}
