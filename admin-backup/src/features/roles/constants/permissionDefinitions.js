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
  {
    entity: 'storage',
    label: 'Storage',
    actions: [
      { key: 'storage:read', label: 'View' },
      { key: 'storage:create', label: 'Upload/Create' },
      { key: 'storage:update', label: 'Edit' },
      { key: 'storage:delete', label: 'Delete' },
    ],
  },
  {
    entity: 'attributes',
    label: 'Attributes',
    actions: [
      { key: 'attributes:read', label: 'View' },
      { key: 'attributes:create', label: 'Add' },
      { key: 'attributes:update', label: 'Edit' },
      { key: 'attributes:delete', label: 'Delete' },
    ],
  },
  {
    entity: 'attribute-values',
    label: 'Attribute Values',
    actions: [
      { key: 'attribute-values:read', label: 'View' },
      { key: 'attribute-values:create', label: 'Add' },
      { key: 'attribute-values:update', label: 'Edit' },
      { key: 'attribute-values:delete', label: 'Delete' },
    ],
  },
  {
    entity: 'attribute-sets',
    label: 'Attribute Sets',
    actions: [
      { key: 'attribute-sets:read', label: 'View' },
      { key: 'attribute-sets:create', label: 'Add' },
      { key: 'attribute-sets:update', label: 'Edit' },
      { key: 'attribute-sets:delete', label: 'Delete' },
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
