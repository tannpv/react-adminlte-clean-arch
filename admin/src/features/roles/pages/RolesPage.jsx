import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RoleList } from '../components/RoleList'
import { RoleModal } from '../components/RoleModal'
import { fetchRoles, createRole, updateRole, deleteRole } from '../api/rolesApi'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { usePermissions } from '../../../shared/hooks/usePermissions'

export function RolesPage() {
  const qc = useQueryClient()
  const { data: roles = [], isLoading: loading, isError, error } = useQuery({ queryKey: ['roles'], queryFn: fetchRoles })
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetRole, setTargetRole] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const { can } = usePermissions()

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
        <button className="btn btn-primary" onClick={() => { setEditing({}); setFormErrors({}); setModalOpen(true) }} disabled={!can('roles:create')} title={!can('roles:create') ? 'Not allowed' : undefined}>Add Role</button>
      </div>

      {loading && <div>Loading...</div>}
      {!loading && !isError && (
        <RoleList
          roles={roles}
          onEdit={(r) => { if (!can('roles:update')) return; setEditing(r); setFormErrors({}); setModalOpen(true) }}
          onDelete={(id) => { if (!can('roles:delete')) return; const r = roles.find(x => x.id === id); setTargetRole(r || { id }); setConfirmOpen(true) }}
        />
      )}
      {!loading && isError && (
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
