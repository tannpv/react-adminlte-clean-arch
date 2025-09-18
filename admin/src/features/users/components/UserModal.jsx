import React from 'react'
import { UserForm } from './UserForm'

export function UserModal({ show, title, initialUser, onClose, onSubmit, errors, submitting, roles, rolesLoading }) {
  const formId = 'user-modal-form'
  const isEditing = !!initialUser?.id
  return (
    <>
      <div
        className={`modal fade ${show ? 'show' : ''}`}
        style={{ display: show ? 'block' : 'none' }}
        tabIndex="-1"
        role="dialog"
        aria-modal={show ? 'true' : undefined}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="close" aria-label="Close" onClick={onClose}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
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
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" form={formId} className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : (isEditing ? 'Update' : 'Add')}
              </button>
            </div>
          </div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show" />}
    </>
  )
}
