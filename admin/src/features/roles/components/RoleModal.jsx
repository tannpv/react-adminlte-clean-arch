import React from 'react'
import { RoleForm } from './RoleForm'

export function RoleModal({ show, title, initialRole, onClose, onSubmit, errors, submitting }) {
  const formId = 'role-modal-form'
  const isEditing = !!initialRole?.id

  return (
    <>
      <div
        className={`modal fade ${show ? 'show' : ''}`}
        style={{ display: show ? 'block' : 'none' }}
        tabIndex="-1"
        role="dialog"
        aria-modal={show ? 'true' : undefined}
        aria-labelledby="roleModalTitle"
      >
        <div className="modal-dialog modal-xl" role="document">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="roleModalTitle">
                <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus'} mr-2`}></i>
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
                      <strong>Role Management:</strong> Define what actions users with this role can perform.
                      Select permissions carefully to ensure proper access control.
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
              </div>
            </div>

            <div className="modal-footer bg-light border-top">
              <div className="d-flex justify-content-between w-100">
                <div className="text-muted">
                  <small>
                    <i className="fas fa-shield-alt mr-1"></i>
                    Changes will affect all users with this role
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
                        <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} mr-1`}></i>
                        {isEditing ? 'Update Role' : 'Create Role'}
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