import React, { useEffect, useState } from 'react'
import Button from '../../../shared/components/ui/Button'
import Form from '../../../shared/components/ui/Form'
import Modal from '../../../shared/components/ui/Modal'

const StoreModal = ({
  isOpen,
  onClose,
  onSubmit,
  store = null,
  isLoading = false,
  error = null
}) => {
  const [formErrors, setFormErrors] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logoUrl: '',
    bannerUrl: '',
    commissionRate: 10.00,
    userId: null
  })

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !store) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name, store])

  // Reset form when modal opens/closes or store changes
  useEffect(() => {
    if (isOpen) {
      if (store) {
        setFormData({
          name: store.name || '',
          slug: store.slug || '',
          description: store.description || '',
          logoUrl: store.logoUrl || '',
          bannerUrl: store.bannerUrl || '',
          commissionRate: store.commissionRate || 10.00,
          userId: store.userId || null
        })
      } else {
        setFormData({
          name: '',
          slug: '',
          description: '',
          logoUrl: '',
          bannerUrl: '',
          commissionRate: 10.00,
          userId: null
        })
      }
      setFormErrors({})
    }
  }, [isOpen, store])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Store name is required'
    } else if (formData.name.length < 2) {
      errors.name = 'Store name must be at least 3 characters'
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Store slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Store slug must contain only lowercase letters, numbers, and hyphens'
    }

    if (formData.logoUrl && !/^https?:\/\/.+/.test(formData.logoUrl)) {
      errors.logoUrl = 'Please enter a valid URL'
    }

    if (formData.bannerUrl && !/^https?:\/\/.+/.test(formData.bannerUrl)) {
      errors.bannerUrl = 'Please enter a valid URL'
    }

    if (formData.commissionRate < 0 || formData.commissionRate > 100) {
      errors.commissionRate = 'Commission rate must be at least 0'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const formId = 'store-modal-form'
  const isEditing = !!store?.id

  return (
    <Modal show={isOpen} onClose={onClose} className="max-w-2xl">
      <Modal.Header onClose={onClose}>
        <div className="flex items-center">
          <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus'} mr-3 text-blue-600`}></i>
          {store ? 'Edit Store' : 'Create Store'}
        </div>
      </Modal.Header>

      <Modal.Body>
        {/* Info Banner */}
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <i className="fas fa-info-circle text-blue-600 mr-2 mt-0.5"></i>
              <div>
                <strong className="text-blue-800">Store Management:</strong>
                <span className="text-blue-700 ml-1">
                  Create or edit stores for your multi-seller platform.
                  All fields marked with * are required.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-circle text-red-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form id={formId} onSubmit={handleSubmit} className="space-y-6">
          {/* Store Name */}
          <Form.Group>
            <Form.Label htmlFor="name" required>
              Store Name
            </Form.Label>
            <Form.Control
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter store name"
              className={formErrors.name ? 'border-red-500' : ''}
            />
            {formErrors.name && (
              <Form.Error>{formErrors.name}</Form.Error>
            )}
          </Form.Group>

          {/* Store Slug */}
          <Form.Group>
            <Form.Label htmlFor="slug" required>
              Store Slug
            </Form.Label>
            <Form.Control
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="Enter store slug"
              className={formErrors.slug ? 'border-red-500' : ''}
            />
            <Form.Help>URL-friendly identifier for the store</Form.Help>
            {formErrors.slug && (
              <Form.Error>{formErrors.slug}</Form.Error>
            )}
          </Form.Group>

          {/* Description */}
          <Form.Group>
            <Form.Label htmlFor="description">
              Description
            </Form.Label>
            <Form.Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter store description"
              rows={3}
            />
          </Form.Group>

          {/* Logo URL */}
          <Form.Group>
            <Form.Label htmlFor="logoUrl">
              Logo URL
            </Form.Label>
            <Form.Control
              type="url"
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleInputChange}
              placeholder="Enter logo URL"
              className={formErrors.logoUrl ? 'border-red-500' : ''}
            />
            {formErrors.logoUrl && (
              <Form.Error>{formErrors.logoUrl}</Form.Error>
            )}
          </Form.Group>

          {/* Banner URL */}
          <Form.Group>
            <Form.Label htmlFor="bannerUrl">
              Banner URL
            </Form.Label>
            <Form.Control
              type="url"
              id="bannerUrl"
              name="bannerUrl"
              value={formData.bannerUrl}
              onChange={handleInputChange}
              placeholder="Enter banner URL"
              className={formErrors.bannerUrl ? 'border-red-500' : ''}
            />
            {formErrors.bannerUrl && (
              <Form.Error>{formErrors.bannerUrl}</Form.Error>
            )}
          </Form.Group>

          {/* Commission Rate */}
          <Form.Group>
            <Form.Label htmlFor="commissionRate" required>
              Commission Rate
            </Form.Label>
            <Form.Control
              type="number"
              id="commissionRate"
              name="commissionRate"
              value={formData.commissionRate}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.01"
              className={formErrors.commissionRate ? 'border-red-500' : ''}
            />
            {formErrors.commissionRate && (
              <Form.Error>{formErrors.commissionRate}</Form.Error>
            )}
          </Form.Group>

        </form>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-between items-center w-full">
          <div className="text-gray-500 text-sm">
            <i className="fas fa-store mr-1"></i>
            Stores help sellers manage their products and orders
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              outline
              onClick={onClose}
              disabled={isLoading}
            >
              <i className="fas fa-times mr-1"></i>
              Cancel
            </Button>
            <Button
              variant={isEditing ? 'warning' : 'success'}
              type="submit"
              form={formId}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1"></i>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} mr-1`}></i>
                  {isEditing ? 'Update Store' : 'Create Store'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default StoreModal