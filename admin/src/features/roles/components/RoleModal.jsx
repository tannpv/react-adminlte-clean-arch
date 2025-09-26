import React from 'react'
import Button from '../../../shared/components/ui/Button'
import Modal from '../../../shared/components/ui/Modal'
import { RoleForm } from './RoleForm'

export function RoleModal({ show, title, initialRole, onClose, onSubmit, errors, submitting }) {
  const formId = 'role-modal-form'
  const isEditing = !!initialRole?.id

  return (
    <Modal show={show} onClose={onClose} className="max-w-4xl">
      <Modal.Header onClose={onClose}>
        <div className="flex items-center">
          <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus'} mr-3 text-blue-600`}></i>
          {title}
        </div>
      </Modal.Header>

      <Modal.Body>
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <i className="fas fa-info-circle text-blue-600 mr-2 mt-0.5"></i>
              <div>
                <strong className="text-blue-800">Role Management:</strong>
                <span className="text-blue-700 ml-1">
                  Define what actions users with this role can perform.
                  Select permissions carefully to ensure proper access control.
                </span>
              </div>
            </div>
          </div>
        </div>

        <RoleForm
          initialRole={initialRole}
          onSubmit={onSubmit}
          errors={errors}
          submitting={submitting}
          formId={formId}
        />
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-between items-center w-full">
          <div className="text-gray-500 text-sm">
            <i className="fas fa-shield-alt mr-1"></i>
            Changes will affect all users with this role
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
                  <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} mr-1`}></i>
                  {isEditing ? 'Update Role' : 'Create Role'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default RoleModal;