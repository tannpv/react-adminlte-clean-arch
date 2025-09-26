import React from 'react'
import Button from '../../../shared/components/ui/Button'
import Modal from '../../../shared/components/ui/Modal'
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
                <strong className="text-blue-800">Product Management:</strong>
                <span className="text-blue-700 ml-1">
                  Create or edit products to build your catalog.
                  All fields marked with * are required.
                </span>
              </div>
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
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-between items-center w-full">
          <div className="text-gray-500 text-sm">
            <i className="fas fa-box mr-1"></i>
            Products help customers discover and purchase your offerings
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
                  {isEditing ? 'Update Product' : 'Create Product'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default ProductModal;