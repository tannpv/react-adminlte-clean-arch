import React, { useEffect, useMemo, useState } from 'react'
import Form from '../../../shared/components/ui/Form'
import { ALL_PERMISSIONS, PERMISSION_GROUPS, groupPermissions } from '../constants/permissionDefinitions'

export function RoleForm({ onSubmit, initialRole, errors = {}, submitting = false, formId = 'role-form' }) {
  const [name, setName] = useState('')
  const [permissions, setPermissions] = useState([])

  useEffect(() => {
    setName(initialRole?.name || '')
  }, [initialRole])

  useEffect(() => {
    if (Array.isArray(initialRole?.permissions)) {
      setPermissions(initialRole.permissions)
    } else {
      setPermissions([])
    }
  }, [initialRole])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name: name.trim(),
      permissions: permissions.filter(Boolean),
    })
  }

  const nameError = typeof errors.name === 'string' ? errors.name : errors.name?.message
  const showNameInvalid = !!nameError
  const permissionsError = typeof errors.permissions === 'string' ? errors.permissions : errors.permissions?.message

  const hydratedGroups = useMemo(() => groupPermissions(permissions), [permissions])

  const reconcilePermissions = (input) => {
    const set = input instanceof Set ? input : new Set(input || [])
    const ordered = ALL_PERMISSIONS.filter((perm) => set.has(perm))
    const extras = Array.from(set).filter((perm) => !ALL_PERMISSIONS.includes(perm))
    return [...ordered, ...extras]
  }

  const togglePermission = (permission, checked) => {
    if (submitting) return
    setPermissions((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(permission)
      } else {
        next.delete(permission)
      }
      return reconcilePermissions(next)
    })
  }

  const toggleGroup = (group, checked) => {
    if (submitting) return
    setPermissions((prev) => {
      const next = new Set(prev)
      group.actions.forEach((action) => {
        if (checked) {
          next.add(action.key)
        } else {
          next.delete(action.key)
        }
      })
      return reconcilePermissions(next)
    })
  }

  const allActions = PERMISSION_GROUPS[0]?.actions || []

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="role-form">
      {/* Role Name Section */}
      <div className="mb-6">
        <Form.Group>
          <Form.Label>
            <i className="fas fa-tag mr-2 text-blue-600"></i>
            Role Name
          </Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter role name (e.g., Administrator, Editor)"
            required
            disabled={submitting}
            className={showNameInvalid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          />
          {showNameInvalid && <Form.Error>{nameError}</Form.Error>}
        </Form.Group>
      </div>

      {/* Permissions Section */}
      <div className="mb-6">
        <Form.Group>
          <Form.Label>
            <i className="fas fa-shield-alt mr-2 text-blue-600"></i>
            Permissions
          </Form.Label>

          {/* Permissions Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                <span className="text-blue-800 font-medium">Select the permissions for this role</span>
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                <i className="fas fa-check-circle mr-1"></i>
                {permissions.length} permission{permissions.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          </div>

          {/* Permissions Grid */}
          <div className="role-permissions-container">
            {hydratedGroups.map((group) => {
              const groupSelectedCount = group.actions.filter((action) => action.selected).length
              const allSelected = groupSelectedCount === group.actions.length && group.actions.length > 0
              const someSelected = groupSelectedCount > 0 && !allSelected
              const groupSelectId = `perm-${group.entity}-all`

              return (
                <div key={group.entity} className="permission-group-card">
                  {/* Group Header */}
                  <div className="permission-group-header">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <i className="fas fa-layer-group text-blue-600"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{group.label}</h3>
                          <p className="text-sm text-gray-600">
                            {groupSelectedCount}/{group.actions.length} permissions selected
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            id={groupSelectId}
                            checked={allSelected}
                            ref={(input) => {
                              if (input) input.indeterminate = someSelected
                            }}
                            onChange={(e) => toggleGroup(group, e.target.checked)}
                            disabled={submitting}
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {allSelected ? 'All Selected' : someSelected ? 'Partial' : 'Select All'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Permissions Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.actions.map((action) => {
                        const inputId = `perm-${group.entity}-${action.key.replace(/[:]/g, '-')}`
                        return (
                          <div key={action.key} className="permission-item">
                            <label className="flex items-center cursor-pointer w-full">
                              <input
                                type="checkbox"
                                className="permission-checkbox"
                                id={inputId}
                                checked={action.selected}
                                onChange={(e) => togglePermission(action.key, e.target.checked)}
                                disabled={submitting}
                              />
                              <div className="ml-3 flex-1">
                                <span className="text-sm font-medium text-gray-900">{action.label}</span>
                                <div className="flex items-center mt-1">
                                  <span className={`permission-status-badge ${action.selected
                                    ? 'permission-status-enabled'
                                    : 'permission-status-disabled'
                                    }`}>
                                    <i className={`fas ${action.selected ? 'fa-check' : 'fa-times'} mr-1`}></i>
                                    {action.selected ? 'Enabled' : 'Disabled'}
                                  </span>
                                </div>
                              </div>
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Error Message */}
          {permissionsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex items-start">
                <i className="fas fa-exclamation-triangle text-red-600 mr-2 mt-0.5"></i>
                <span className="text-red-800">{permissionsError}</span>
              </div>
            </div>
          )}
        </Form.Group>
      </div>
    </form>
  )
}