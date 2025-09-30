import React from 'react'
import Button from '../../../shared/components/ui/Button'
import Modal from '../../../shared/components/ui/Modal'
import { UserForm } from './UserForm'

export function UserModal({ show, title, initialUser, onClose, onSubmit, errors, submitting, roles, rolesLoading }) {
  const formId = 'user-modal-form'
  const isEditing = !!initialUser?.id

  return (
    <Modal show={show} onClose={onClose} className="max-w-4xl">
      <Modal.Header onClose={onClose}>
        <div className="flex items-center">
          <i className={`fas ${isEditing ? 'fa-user-edit' : 'fa-user-plus'} mr-3 text-blue-600`}></i>
          {title}
        </div>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <i className="fas fa-info-circle text-blue-600 mr-2 mt-0.5"></i>
              <div>
                <strong className="text-blue-800">User Management:</strong>
                <span className="text-blue-700 ml-1">
                  Create or edit user accounts with proper roles and permissions.
                </span>
                <div className="text-blue-600 text-sm mt-1">
                  All fields marked with * are required.
                </div>
              </div>
            </div>
          </div>
        </div>

        <UserForm
          initialUser={initialUser}
          onCancel={onClose}
          onSubmit={onSubmit}
          errors={errors}
          submitting={submitting}
          roleOptions={roles}
          formId={formId}
          rolesLoading={rolesLoading}
        />
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-between items-center w-full">
          <div className="text-gray-500 text-sm">
            <i className="fas fa-shield-alt mr-1"></i>
            User permissions are controlled by assigned roles
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              outline
              onClick={onClose}
              disabled={submitting}
            >
              <i className="fas fa-times mr-1"></i>
              Cancel
            </Button>
            <Button
              variant={isEditing ? 'warning' : 'success'}
              type="submit"
              form={formId}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1"></i>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <i className={`fas ${isEditing ? 'fa-save' : 'fa-user-plus'} mr-1`}></i>
                  {isEditing ? 'Update User' : 'Create User'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default UserModal;