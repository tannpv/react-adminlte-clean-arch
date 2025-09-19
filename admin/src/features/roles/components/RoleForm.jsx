import React, { useEffect, useMemo, useState } from 'react'
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
    <form id={formId} onSubmit={handleSubmit} noValidate className="mb-3">
      <div className="form-group">
        <label>Name</label>
        <input
          className={`form-control ${showNameInvalid ? 'is-invalid' : ''}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={submitting}
        />
        {showNameInvalid && <div className="invalid-feedback">{nameError}</div>}
      </div>

      <div className="form-group">
        <label>Permissions</label>
        <div className="table-responsive">
          <table className="table table-bordered mb-2">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Module</th>
                <th style={{ width: '15%' }}>Select All</th>
                {allActions.map((action) => (
                  <th key={`header-${action.key}`} className="text-center">{action.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hydratedGroups.map((group) => {
                const groupSelectedCount = group.actions.filter((action) => action.selected).length
                const allSelected = groupSelectedCount === group.actions.length && group.actions.length > 0
                const someSelected = groupSelectedCount > 0 && !allSelected
                return (
                  <tr key={group.entity}>
                    <td className="align-middle">{group.label}</td>
                    <td className="text-center align-middle">
                      <input
                        type="checkbox"
                        className="form-check-input position-static"
                        checked={allSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = someSelected
                        }}
                        onChange={(e) => toggleGroup(group, e.target.checked)}
                        aria-label={`Toggle all ${group.label} permissions`}
                        disabled={submitting}
                      />
                    </td>
                    {group.actions.map((action) => {
                      const inputId = `perm-${group.entity}-${action.key.replace(/[:]/g, '-')}`
                      return (
                        <td key={action.key} className="text-center align-middle">
                          <div className="custom-control custom-checkbox d-inline-flex align-items-center">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id={inputId}
                              checked={action.selected}
                              onChange={(e) => togglePermission(action.key, e.target.checked)}
                              disabled={submitting}
                            />
                            <label className="custom-control-label" htmlFor={inputId}>
                              <span className="sr-only">{`${group.label} ${action.label}`}</span>
                            </label>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {permissionsError && <div className="invalid-feedback d-block">{permissionsError}</div>}
      </div>
    </form>
  )
}
