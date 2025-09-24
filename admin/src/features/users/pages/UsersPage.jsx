import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { usePermissions } from '../../../shared/hooks/usePermissions'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'
import { getUserDisplayName } from '../../../shared/lib/userDisplayName'
import { fetchRoles } from '../../roles/api/rolesApi'
import { UserList } from '../components/UserList'
import { UserModal } from '../components/UserModal'
import { useUsers } from '../hooks/useUsers'
import { useUserSearch } from '../hooks/useUserSearch'

const isValidationErrorMap = (err) => {
  if (!err || typeof err !== 'object' || Array.isArray(err)) return false
  return Object.values(err).every((value) => typeof value === 'string')
}

export function UsersPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetUser, setTargetUser] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'users')

  const {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
  } = useUserSearch()

  const {
    users = [],
    isLoading: loading,
    isError,
    error,
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
  } = useUsers({ search: debouncedTerm })

  const submitting = createUserMutation.isPending || updateUserMutation.isPending
  const { can } = usePermissions()

  // Prefer cached roles if present; only fetch when needed
  const cachedRoles = qc.getQueryData(['roles'])
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    // Enable fetching if the modal is open (needs options), or user can change users, or we already have cache
    enabled: modalOpen || !!cachedRoles || can('users:create') || can('users:update'),
    // Seed from cache to avoid empty select while query resolves
    initialData: cachedRoles,
    // Roles change rarely; keep fresh for longer to avoid refetches
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  })

  const rolesById = useMemo(
    () => Object.fromEntries((roles || []).map(role => [role.id, role])),
    [roles]
  )

  // Calculate statistics
  const totalUsers = users.length
  const activeUsers = users.filter(user => user.isActive !== false).length
  const adminUsers = users.filter(user =>
    user.roles && user.roles.some(roleId => rolesById[roleId]?.name === 'Administrator')
  ).length
  const usersWithProfile = users.filter(user =>
    user.profile && (user.profile.firstName || user.profile.lastName)
  ).length

  return (
    <>
      <div className="page-card">
        <div className="page-header">
          <div>
            <h2 className="page-title">
              <i className="fas fa-users mr-2"></i>
              {t('title', 'Users & Members')}
            </h2>
            <p className="page-subtitle">
              {t('subtitle', 'Manage workspace members, permissions, and access. Add new users and assign roles to control what they can do.')}
            </p>
          </div>
          <div className="page-actions">
            <div className="search-control">
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                </div>
                <input
                  type="search"
                  className="form-control"
                  placeholder={t('search_placeholder', 'Search users by name or email...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <button
              className="btn btn-outline-secondary"
              onClick={() => qc.invalidateQueries({ queryKey: ['roles'] })}
              disabled={rolesLoading}
              title={t('refresh_roles_tooltip', 'Refresh role options')}
            >
              <i className="fas fa-sync-alt mr-2"></i>
              {t('refresh_roles', 'Refresh Roles')}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => { setEditing({}); setFormErrors({}); setModalOpen(true) }}
              disabled={!can('users:create')}
              title={!can('users:create') ? t('not_allowed', 'Not allowed') : undefined}
            >
              <i className="fas fa-user-plus mr-2"></i>
              {t('add_user', 'Add New User')}
            </button>
          </div>
        </div>

        <div className="page-body">
          {loading && (
            <div className="loading-state">
              <div className="loading-content">
                <i className="fas fa-spinner fa-spin loading-icon"></i>
                <h4 className="loading-title">{t('loading_title', 'Loading Users')}</h4>
                <p className="loading-description">{t('loading_description', 'Please wait while we fetch the user information...')}</p>
              </div>
            </div>
          )}

          {!loading && !isError && users.length > 0 && (
            <div className="users-content">
              <div className="users-stats mb-4">
                <div className="row">
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-users"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{totalUsers}</div>
                        <div className="stat-label">{t('total_users', 'Total Users')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-user-check"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{activeUsers}</div>
                        <div className="stat-label">{t('active_users', 'Active Users')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-crown"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{adminUsers}</div>
                        <div className="stat-label">{t('administrators', 'Administrators')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-id-card"></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{usersWithProfile}</div>
                        <div className="stat-label">{t('with_profiles', 'With Profiles')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="users-table-section">
                <div className="section-header">
                  <h5 className="section-title">
                    <i className="fas fa-list mr-2"></i>
                    {t('user_management', 'User Management')}
                  </h5>
                  <p className="section-description">
                    {t('user_management_description', 'Manage existing users, their roles, and permissions.')}
                    {searchTerm && ` ${t('showing_results_for', 'Showing results for')} "${searchTerm}"`}
                  </p>
                </div>

                <UserList
                  users={users}
                  rolesById={rolesById}
                  onEdit={(u) => { if (!can('users:update')) return; setEditing(u); setFormErrors({}); setModalOpen(true) }}
                  onDelete={(id) => {
                    if (!can('users:delete')) return
                    const user = users.find(u => u.id === id)
                    setTargetUser(user || { id })
                    setConfirmOpen(true)
                  }}
                />
              </div>
            </div>
          )}

          {!loading && !isError && users.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-content">
                <i className="fas fa-user-slash empty-state-icon"></i>
                <h4 className="empty-state-title">
                  {searchTerm ? t('no_users_found', 'No Users Found') : t('no_users_yet', 'No Users Yet')}
                </h4>
                <p className="empty-state-description">
                  {searchTerm
                    ? t('no_users_match_search', `No users match your search for "${searchTerm}". Try adjusting your search terms.`)
                    : t('get_started_add_user', 'Get started by adding your first user to the workspace.')
                  }
                </p>
                {!searchTerm && can('users:create') && (
                  <button
                    className="btn btn-primary"
                    onClick={() => { setEditing({}); setFormErrors({}); setModalOpen(true) }}
                  >
                    <i className="fas fa-user-plus mr-2"></i>
                    {t('add_first_user', 'Add First User')}
                  </button>
                )}
              </div>
            </div>
          )}

          {!loading && isError && (
            <div className="error-state">
              <div className="error-content">
                <i className="fas fa-exclamation-circle error-icon"></i>
                <h4 className="error-title">{t('failed_to_load_users', 'Failed to Load Users')}</h4>
                <p className="error-description">
                  {error?.message || t('unexpected_error_loading_users', 'An unexpected error occurred while loading users.')}
                </p>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-redo mr-2"></i>
                  {t('try_again', 'Try Again')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <UserModal
        show={modalOpen}
        title={editing ? t('edit_user', 'Edit User') : t('add_user', 'Add User')}
        initialUser={editing}
        errors={formErrors}
        submitting={submitting}
        roles={roles}
        rolesLoading={rolesLoading}
        onClose={() => { setModalOpen(false); setEditing(null); setFormErrors({}) }}
        onSubmit={async (payload) => {
          setFormErrors({})
          try {
            if (editing?.id) {
              await handleUpdateUser(editing.id, payload)
            } else {
              await handleCreateUser(payload)
            }
            setModalOpen(false)
            setEditing(null)
          } catch (e) {
            if (isValidationErrorMap(e)) {
              setFormErrors(e)
            }
          }
        }}
      />

      <ConfirmModal
        show={confirmOpen}
        title={t('delete_user', 'Delete User')}
        message={t('confirm_delete_user', `Are you sure you want to delete ${getUserDisplayName(targetUser) || 'this user'}?`)}
        confirmText={t('delete', 'Delete')}
        cancelText={t('cancel', 'Cancel')}
        onCancel={() => { setConfirmOpen(false); setTargetUser(null) }}
        onConfirm={async () => {
          const id = targetUser?.id
          await handleDeleteUser(id)
          if (editing?.id === id) setEditing(null)
          setConfirmOpen(false)
          setTargetUser(null)
        }}
      />
    </>
  )
}