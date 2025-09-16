import React from 'react'
import { UserForm } from './UserForm'

export function UserModal({ show, title, initialUser, onClose, onSubmit }) {
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
              <UserForm initialUser={initialUser} onCancel={onClose} onSubmit={onSubmit} />
            </div>
          </div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show" />}
    </>
  )
}

