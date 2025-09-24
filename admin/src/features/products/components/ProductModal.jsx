import React from 'react'
import { ProductForm } from './ProductForm'

export function ProductModal({
  show,
  title,
  initialProduct,
  errors,
  submitting,
  onClose,
  onSubmit,
  categoryOptions = [],
  categoryTree = [],
  categoriesLoading = false,
}) {
  const formId = 'product-modal-form'
  const isEditing = !!initialProduct?.id

  return (
    <>
      <div
        className={`modal fade ${show ? 'show' : ''}`}
        style={{ display: show ? 'block' : 'none' }}
        tabIndex="-1"
        role="dialog"
        aria-modal={show ? 'true' : undefined}
        aria-labelledby="productModalTitle"
      >
        <div className="modal-dialog modal-xl" role="document">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="productModalTitle">
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
                      <strong>Product Management:</strong> Create or edit products to build your catalog.
                      All fields marked with * are required.
                    </div>
                  </div>
                </div>

                <ProductForm
                  formId={formId}
                  initialProduct={initialProduct}
                  errors={errors}
                  submitting={submitting}
                  onSubmit={onSubmit}
                  categoryOptions={categoryOptions}
                  categoryTree={categoryTree}
                  categoriesLoading={categoriesLoading}
                />
              </div>
            </div>

            <div className="modal-footer bg-light border-top">
              <div className="d-flex justify-content-between w-100">
                <div className="text-muted">
                  <small>
                    <i className="fas fa-box mr-1"></i>
                    Products help customers discover and purchase your offerings
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
                        {isEditing ? 'Update Product' : 'Create Product'}
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