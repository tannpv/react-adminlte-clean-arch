import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import Button from '../../../shared/components/ui/Button'
import Card from '../../../shared/components/ui/Card'
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
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <i className="fas fa-users mr-3 text-blue-600"></i>
                {t('title', 'Users & Members')}
              </h1>
              <p className="mt-2 text-gray-600 max-w-2xl">
                {t('subtitle', 'Manage workspace members, permissions, and access. Add new users and assign roles to control what they can do.')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <input
                  type="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={t('search_placeholder', 'Search users by name or email...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline-secondary"
                onClick={() => qc.invalidateQueries({ queryKey: ['roles'] })}
                disabled={rolesLoading}
                title={t('refresh_roles_tooltip', 'Refresh role options')}
              >
                <i className="fas fa-sync-alt mr-2"></i>
                {t('refresh_roles', 'Refresh Roles')}
              </Button>
              <Button
                variant="primary"
                onClick={() => { setEditing({}); setFormErrors({}); setModalOpen(true) }}
                disabled={!can('users:create')}
                title={!can('users:create') ? t('not_allowed', 'Not allowed') : undefined}
              >
                <i className="fas fa-user-plus mr-2"></i>
                {t('add_user', 'Add New User')}
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {!loading && !isError && users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <i className="fas fa-users text-2xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-3xl font-bold">{totalUsers}</div>
                  <div className="text-blue-100">{t('total_users', 'Total Users')}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <i className="fas fa-user-check text-2xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-3xl font-bold">{activeUsers}</div>
                  <div className="text-green-100">{t('active_users', 'Active Users')}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <i className="fas fa-crown text-2xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-3xl font-bold">{adminUsers}</div>
                  <div className="text-purple-100">{t('administrators', 'Administrators')}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <i className="fas fa-id-card text-2xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-3xl font-bold">{usersWithProfile}</div>
                  <div className="text-orange-100">{t('with_profiles', 'With Profiles')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <Card.Body>
              <div className="text-center py-12">
                <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                <h4 className="text-lg font-medium text-gray-900 mb-2">{t('loading_title', 'Loading Users')}</h4>
                <p className="text-gray-600">{t('loading_description', 'Please wait while we fetch the user information...')}</p>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Users Content */}
        {!loading && !isError && users.length > 0 && (
          <div className="space-y-6">

            <Card>
              <Card.Header>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <i className="fas fa-list mr-2 text-blue-600"></i>
                      {t('user_management', 'User Management')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {t('user_management_description', 'Manage existing users, their roles, and permissions.')}
                      {searchTerm && ` ${t('showing_results_for', 'Showing results for')} "${searchTerm}"`}
                    </p>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
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
              </Card.Body>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!loading && !isError && users.length === 0 && (
          <Card>
            <Card.Body>
              <div className="text-center py-12">
                <i className="fas fa-user-slash text-4xl text-gray-400 mb-4"></i>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? t('no_users_found', 'No Users Found') : t('no_users_yet', 'No Users Yet')}
                </h4>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? t('no_users_match_search', `No users match your search for "${searchTerm}". Try adjusting your search terms.`)
                    : t('get_started_add_user', 'Get started by adding your first user to the workspace.')
                  }
                </p>
                {!searchTerm && can('users:create') && (
                  <Button
                    variant="primary"
                    onClick={() => { setEditing({}); setFormErrors({}); setModalOpen(true) }}
                  >
                    <i className="fas fa-user-plus mr-2"></i>
                    {t('add_first_user', 'Add First User')}
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Error State */}
        {!loading && isError && (
          <Card>
            <Card.Body>
              <div className="text-center py-12">
                <i className="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
                <h4 className="text-lg font-medium text-gray-900 mb-2">{t('failed_to_load_users', 'Failed to Load Users')}</h4>
                <p className="text-gray-600 mb-6">
                  {error?.message || t('unexpected_error_loading_users', 'An unexpected error occurred while loading users.')}
                </p>
                <Button
                  variant="outline-primary"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-redo mr-2"></i>
                  {t('try_again', 'Try Again')}
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}
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

export default UsersPage;