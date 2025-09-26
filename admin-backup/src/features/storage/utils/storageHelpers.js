const STORAGE_PERMISSION_KEYS = {
  read: 'storage:read',
  create: 'storage:create',
  update: 'storage:update',
  delete: 'storage:delete',
}

export function deriveStoragePermissions(permissionSet) {
  const set = permissionSet instanceof Set ? permissionSet : new Set(permissionSet || [])

  const canRead = set.has(STORAGE_PERMISSION_KEYS.read)
  const canCreate = set.has(STORAGE_PERMISSION_KEYS.create)
  const canUpdate = set.has(STORAGE_PERMISSION_KEYS.update)
  const canDelete = set.has(STORAGE_PERMISSION_KEYS.delete)
  const canViewStorage = canRead || canCreate || canUpdate || canDelete

  return {
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    canViewStorage,
  }
}

export function mergeStorageItems(directories = [], files = []) {
  return [
    ...directories.map((dir) => ({ ...dir, type: 'directory' })),
    ...files.map((file) => ({ ...file, type: 'file' })),
  ]
}

export function normalizeDirectoryPayload(input) {
  if (typeof input === 'string') {
    return input.trim()
  }
  if (input && typeof input.name === 'string') {
    return input.name.trim()
  }
  return ''
}

export { STORAGE_PERMISSION_KEYS }
