import React from 'react'
import Button from '../../../shared/components/ui/Button'
import Table from '../../../shared/components/ui/Table'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'
import { getUserDisplayName } from '../../../shared/lib/userDisplayName'

export function UserList({ users, onEdit, onDelete, rolesById }) {
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'users')

  return (
    <Table hover darkHeader>
      <Table.Header>
        <Table.HeaderCell>
          <i className="fas fa-hashtag mr-2"></i>
          {t('id', 'ID')}
        </Table.HeaderCell>
        <Table.HeaderCell>
          <i className="fas fa-user-circle mr-2"></i>
          {t('avatar', 'Avatar')}
        </Table.HeaderCell>
        <Table.HeaderCell>
          <i className="fas fa-user mr-2"></i>
          {t('name', 'Name')}
        </Table.HeaderCell>
        <Table.HeaderCell>
          <i className="fas fa-envelope mr-2"></i>
          {t('email', 'Email')}
        </Table.HeaderCell>
        <Table.HeaderCell>
          <i className="fas fa-shield-alt mr-2"></i>
          {t('roles', 'Roles')}
        </Table.HeaderCell>
        <Table.HeaderCell>
          <i className="fas fa-info-circle mr-2"></i>
          {t('status', 'Status')}
        </Table.HeaderCell>
        <Table.HeaderCell className="text-center">
          <i className="fas fa-cogs mr-2"></i>
          {t('actions', 'Actions')}
        </Table.HeaderCell>
      </Table.Header>
      <Table.Body>
        {users.map((user) => {
          const displayName = getUserDisplayName(user)
          const userRoles = Array.isArray(user.roles) && rolesById
            ? user.roles.map(id => rolesById[id]).filter(Boolean)
            : []
          const isAdmin = userRoles.some(role => role.name === 'Administrator')
          const hasProfile = user.profile && (user.profile.firstName || user.profile.lastName)
          const isActive = user.isActive !== false

          return (
            <Table.Row key={user.id}>
              <Table.Cell className="font-medium text-gray-900">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {user.id}
                </span>
              </Table.Cell>
              <Table.Cell>
                <div className="flex items-center">
                  {user.profile?.pictureUrl ? (
                    <img
                      src={user.profile.pictureUrl}
                      alt={displayName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <i className="fas fa-user text-gray-600"></i>
                    </div>
                  )}
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900 text-base">{displayName}</span>
                    {isAdmin && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <i className="fas fa-crown mr-1"></i>
                        {t('admin', 'Admin')}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    {hasProfile ? t('profile_complete', 'Profile Complete') : t('basic_info_only', 'Basic Info Only')}
                  </span>
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-envelope mr-2"></i>
                  <span>{user.email}</span>
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex flex-wrap gap-1">
                  {userRoles.length > 0 ? (
                    <>
                      {userRoles.slice(0, 2).map((role, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {role.name}
                        </span>
                      ))}
                      {userRoles.length > 2 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{userRoles.length - 2} {t('more', 'more')}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-500 text-sm">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      {t('no_roles', 'No roles')}
                    </span>
                  )}
                </div>
              </Table.Cell>
              <Table.Cell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  <i className={`fas ${isActive ? 'fa-check-circle' : 'fa-times-circle'} mr-1`}></i>
                  {isActive ? t('active', 'Active') : t('inactive', 'Inactive')}
                </span>
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap">
                <div className="flex justify-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onEdit(user)}
                    title={t('edit_user_information', 'Edit user information')}
                  >
                    <i className="fas fa-edit mr-1"></i>
                    {t('edit', 'Edit')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(user.id)}
                    title={t('delete_user', 'Delete user')}
                  >
                    <i className="fas fa-trash mr-1"></i>
                    {t('delete', 'Delete')}
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}

export default UserList;