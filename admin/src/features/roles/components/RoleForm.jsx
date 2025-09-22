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
    <form id={formId} onSubmit={handleSubmit} noValidate className="role-form">
      {/* Role Name Section */}
      <div className="form-section mb-4">
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-tag mr-2"></i>
            Role Name
          </label>
          <input
            className={`form-control ${showNameInvalid ? 'is-invalid' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter role name (e.g., Administrator, Editor)"
            required
            disabled={submitting}
          />
          {showNameInvalid && <div className="invalid-feedback">{nameError}</div>}
        </div>
      </div>

      {/* Permissions Section */}
      <div className="form-section">
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-shield-alt mr-2"></i>
            Permissions
          </label>
          <div className="permissions-container">
            <div className="permissions-header mb-3">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="mb-0 text-muted">
                    <i className="fas fa-info-circle mr-1"></i>
                    Select the permissions for this role
                  </h6>
                </div>
                <div className="col-md-6 text-right">
                  <small className="text-muted">
                    {permissions.length} permission{permissions.length !== 1 ? 's' : ''} selected
                  </small>
                </div>
              </div>
            </div>

            <div className="permissions-table-container">
              <div className="table-responsive">
                <table className="table table-hover permissions-table">
                  <thead className="table-dark">
                    <tr>
                      <th className="module-column">
                        <i className="fas fa-layer-group mr-1"></i>
                        Module
                      </th>
                      <th className="select-all-column text-center">
                        <i className="fas fa-check-double mr-1"></i>
                        All
                      </th>
                      {allActions.map((action) => (
                        <th key={`header-${action.key}`} className="text-center action-column">
                          <span className="action-label">{action.label}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hydratedGroups.map((group) => {
                      const groupSelectedCount = group.actions.filter((action) => action.selected).length
                      const allSelected = groupSelectedCount === group.actions.length && group.actions.length > 0
                      const someSelected = groupSelectedCount > 0 && !allSelected
                      const groupSelectId = `perm-${group.entity}-all`
                      return (
                        <tr key={group.entity} className="permission-row">
                          <td className="module-cell">
                            <div className="module-info">
                              <strong>{group.label}</strong>
                              <small className="d-block text-muted">
                                {groupSelectedCount}/{group.actions.length} selected
                              </small>
                            </div>
                          </td>
                          <td className="select-all-cell text-center">
                            <div className="custom-control custom-checkbox d-inline-flex align-items-center justify-content-center">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                id={groupSelectId}
                                checked={allSelected}
                                ref={(input) => {
                                  if (input) input.indeterminate = someSelected
                                }}
                                onChange={(e) => toggleGroup(group, e.target.checked)}
                                disabled={submitting}
                              />
                              <label className="custom-control-label" htmlFor={groupSelectId}>
                                <span className="sr-only">Toggle all {group.label} permissions</span>
                              </label>
                            </div>
                          </td>
                          {group.actions.map((action) => {
                            const inputId = `perm-${group.entity}-${action.key.replace(/[:]/g, '-')}`
                            return (
                              <td key={action.key} className="text-center action-cell">
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
            </div>

            {permissionsError && (
              <div className="alert alert-danger mt-3" role="alert">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {permissionsError}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}