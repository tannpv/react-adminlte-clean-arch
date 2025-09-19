import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RoleList } from '../components/RoleList'
import { RoleModal } from '../components/RoleModal'
import { fetchRoles, createRole, updateRole, deleteRole } from '../api/rolesApi'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { usePermissions } from '../../../shared/hooks/usePermissions'

export function RolesPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetRole, setTargetRole] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const { can } = usePermissions()
  const [editing, setEditing] = useState(null)

  const canViewRoles = can('roles:read')
  const canCreateRole = can('roles:create')
  const canUpdateRole = can('roles:update')
  const canDeleteRole = can('roles:delete')

  const {
    data: rolesData,
    isLoading: loading,
    isError,
    error,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    enabled: canViewRoles,
  })
  const roles = Array.isArray(rolesData) ? rolesData : []

  const createMutation = useMutation({
    mutationFn: (payload) => createRole(payload),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['roles'] }) },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateRole(id, payload),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['roles'] }) },
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteRole(id),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['roles'] }) },
  })

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Roles</h3>
        <button
          className="btn btn-primary"
          onClick={() => { setEditing({}); setFormErrors({}); setModalOpen(true) }}
          disabled={!canCreateRole}
          title={!canCreateRole ? 'Not allowed' : undefined}
        >
          Add Role
        </button>
      </div>

      {!canViewRoles && (
        <div className="alert alert-warning" role="alert">
          You do not have permission to view roles.
        </div>
      )}

      {canViewRoles && loading && <div>Loading...</div>}
      {canViewRoles && !loading && !isError && (
        <RoleList
          roles={roles}
          canEdit={canUpdateRole}
          canDelete={canDeleteRole}
          onEdit={(role) => {
            setEditing(role)
            setFormErrors({})
            setModalOpen(true)
          }}
          onDelete={(id) => {
            const role = roles.find(x => x.id === id)
            setTargetRole(role || { id })
            setConfirmOpen(true)
          }}
        />
      )}
      {canViewRoles && !loading && isError && (
        <div className="alert alert-danger" role="alert">{error?.message || 'Failed to load roles'}</div>
      )}

      <RoleModal
        show={modalOpen}
        title={editing?.id ? 'Edit Role' : 'Add Role'}
        initialRole={editing}
        errors={formErrors}
        submitting={submitting}
        onClose={() => { setModalOpen(false); setEditing(null); setFormErrors({}) }}
        onSubmit={async (payload) => {
          setSubmitting(true)
          setFormErrors({})
          try {
            if (editing?.id) {
              await updateMutation.mutateAsync({ id: editing.id, payload })
            } else {
              await createMutation.mutateAsync(payload)
            }
            setModalOpen(false)
            setEditing(null)
          } catch (e) {
            const status = e?.response?.status
            const vErrors = e?.response?.data?.errors || e?.response?.data?.error?.details?.fieldErrors
            if (status === 400 && vErrors && typeof vErrors === 'object') {
              const norm = Object.fromEntries(Object.entries(vErrors).map(([k, v]) => [k, typeof v === 'string' ? v : v?.message || 'Invalid']))
              setFormErrors(norm)
            }
          } finally {
            setSubmitting(false)
          }
        }}
      />

      <ConfirmModal
        show={confirmOpen}
        title="Delete Role"
        message={`Are you sure you want to delete ${targetRole?.name || 'this role'}?`}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => { setConfirmOpen(false); setTargetRole(null) }}
        onConfirm={async () => {
          const id = targetRole?.id
          await deleteMutation.mutateAsync(id)
          if (editing?.id === id) setEditing(null)
          setConfirmOpen(false)
          setTargetRole(null)
        }}
      />
    </>
  )
}
