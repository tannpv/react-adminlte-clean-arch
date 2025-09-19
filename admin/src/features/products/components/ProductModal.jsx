import React from 'react'
import { ProductForm } from './ProductForm'

export function ProductModal({ show, title, initialProduct, errors, submitting, onClose, onSubmit }) {
  const formId = 'product-modal-form'
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
              <ProductForm
                formId={formId}
                initialProduct={initialProduct}
                errors={errors}
                submitting={submitting}
                onCancel={onClose}
                onSubmit={onSubmit}
              />
            </div>
          </div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show" />}
    </>
  )
}
