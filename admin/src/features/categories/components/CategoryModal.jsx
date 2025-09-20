import React from 'react'
import { CategoryForm } from './CategoryForm'

export function CategoryModal({ show, title, initialCategory, onClose, onSubmit, errors, submitting, categories = [], hierarchy = [] }) {
  const formId = 'category-modal-form'
  const isEditing = !!initialCategory?.id
  return (
    <>
      <div className={`modal fade ${show ? 'show' : ''}`} style={{ display: show ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-modal={show ? 'true' : undefined}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="close" aria-label="Close" onClick={onClose}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <CategoryForm
                formId={formId}
                initialCategory={initialCategory}
                onSubmit={onSubmit}
                onCancel={onClose}
                errors={errors}
                submitting={submitting}
                categories={categories}
                hierarchy={hierarchy}
                isOpen={show}
              />
            </div>
          </div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show" />}
    </>
  )
}
