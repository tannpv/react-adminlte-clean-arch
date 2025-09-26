import React from 'react'
import Button from '../../../shared/components/ui/Button'
import Modal from '../../../shared/components/ui/Modal'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'
import { CategoryForm } from './CategoryForm'

export function CategoryModal({ show, title, initialCategory, onClose, onSubmit, errors, submitting, categories = [], tree = [], hierarchy = [] }) {
  const formId = 'category-modal-form'
  const isEditing = !!initialCategory?.id
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'categories')

  return (
    <Modal show={show} onClose={onClose} className="max-w-2xl">
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
                <strong className="text-blue-800">{t('category_management', 'Category Management')}:</strong>
                <span className="text-blue-700 ml-1">
                  {t('category_management_description', 'Create or edit product categories to organize your inventory. Categories help customers find products more easily.')}
                </span>
              </div>
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
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-between items-center w-full">
          <div className="text-gray-500 text-sm">
            <i className="fas fa-sitemap mr-1"></i>
            Categories help organize products and improve navigation
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
                  {isEditing ? 'Update Category' : 'Create Category'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  )
}