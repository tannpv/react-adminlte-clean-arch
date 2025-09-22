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
        aria-labelledby="userModalTitle"
      >
        <div className="modal-dialog modal-xl" role="document">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="userModalTitle">
                <i className={`fas ${isEditing ? 'fa-user-edit' : 'fa-user-plus'} mr-2`}></i>
                {title}
              </h5>
              <button
                type="button"
                className="close text-white"
                aria-label="Close"
                onClick={onClose}
                disabled={submitting}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-12">
                    <div className="alert alert-info" role="alert">
                      <i className="fas fa-info-circle mr-2"></i>
                      <strong>User Management:</strong> Create or edit user accounts with proper roles and permissions.
                      All fields marked with * are required.
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
              </div>
            </div>

            <div className="modal-footer bg-light border-top">
              <div className="d-flex justify-content-between w-100">
                <div className="text-muted">
                  <small>
                    <i className="fas fa-shield-alt mr-1"></i>
                    User permissions are controlled by assigned roles
                  </small>
                </div>
                <div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary mr-2"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    <i className="fas fa-times mr-1"></i>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form={formId}
                    className={`btn ${isEditing ? 'btn-warning' : 'btn-success'}`}
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
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show" />}
    </>
  )
}