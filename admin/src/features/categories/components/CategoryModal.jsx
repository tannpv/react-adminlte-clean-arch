import React from 'react'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'
import { CategoryForm } from './CategoryForm'

export function CategoryModal({ show, title, initialCategory, onClose, onSubmit, errors, submitting, categories = [], tree = [], hierarchy = [] }) {
  const formId = 'category-modal-form'
  const isEditing = !!initialCategory?.id
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'categories')

  return (
    <>
      <div
        className={`modal fade ${show ? 'show' : ''}`}
        style={{ display: show ? 'block' : 'none' }}
        tabIndex="-1"
        role="dialog"
        aria-modal={show ? 'true' : undefined}
        aria-labelledby="categoryModalTitle"
      >
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="categoryModalTitle">
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
                      <strong>{t('category_management', 'Category Management')}:</strong> {t('category_management_description', 'Create or edit product categories to organize your inventory. Categories help customers find products more easily.')}
                    </div>
                  </div>
                </div>

                <CategoryForm
                  formId={formId}
                  initialCategory={initialCategory}
                  onSubmit={onSubmit}
                  onCancel={onClose}
                  errors={errors}
                  submitting={submitting}
                  categories={categories}
                  tree={tree}
                  hierarchy={hierarchy}
                  isOpen={show}
                />
              </div>
            </div>

            <div className="modal-footer bg-light border-top">
              <div className="d-flex justify-content-between w-100">
                <div className="text-muted">
                  <small>
                    <i className="fas fa-sitemap mr-1"></i>
                    Categories help organize products and improve navigation
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
                        {isEditing ? 'Update Category' : 'Create Category'}
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