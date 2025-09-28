import React, { useEffect, useState } from 'react'
import Button from '../../../shared/components/ui/Button'
import Form from '../../../shared/components/ui/Form'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'

const StoreModal = ({
  isOpen,
  onClose,
  onSubmit,
  store = null,
  isLoading = false,
  error = null
}) => {
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'stores')
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
      errors.name = t('storeNameRequired')
    } else if (formData.name.length < 2) {
      errors.name = t('storeNameMinLength')
    }
    
    if (!formData.slug.trim()) {
      errors.slug = t('storeSlugRequired')
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = t('storeSlugPattern')
    }
    
    if (formData.logoUrl && !/^https?:\/\/.+/.test(formData.logoUrl)) {
      errors.logoUrl = t('logoUrlPattern')
    }
    
    if (formData.bannerUrl && !/^https?:\/\/.+/.test(formData.bannerUrl)) {
      errors.bannerUrl = t('bannerUrlPattern')
    }
    
    if (formData.commissionRate < 0 || formData.commissionRate > 100) {
      errors.commissionRate = t('commissionRateMin')
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 mt-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              {store ? t('editStore') : t('createStore')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Store Name */}
            <Form.Group>
              <Form.Label htmlFor="name" required>
                {t('storeName')}
              </Form.Label>
              <Form.Control
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('storeNamePlaceholder')}
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <Form.Error>{formErrors.name}</Form.Error>
              )}
            </Form.Group>

            {/* Store Slug */}
            <Form.Group>
              <Form.Label htmlFor="slug" required>
                {t('storeSlug')}
              </Form.Label>
              <Form.Control
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder={t('storeSlugPlaceholder')}
                className={formErrors.slug ? 'border-red-500' : ''}
              />
              <Form.Help>{t('storeSlugHelp')}</Form.Help>
              {formErrors.slug && (
                <Form.Error>{formErrors.slug}</Form.Error>
              )}
            </Form.Group>

            {/* Description */}
            <Form.Group>
              <Form.Label htmlFor="description">
                {t('description')}
              </Form.Label>
              <Form.Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('descriptionPlaceholder')}
                rows={3}
              />
            </Form.Group>

            {/* Logo URL */}
            <Form.Group>
              <Form.Label htmlFor="logoUrl">
                {t('logoUrl')}
              </Form.Label>
              <Form.Control
                type="url"
                id="logoUrl"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleInputChange}
                placeholder={t('logoUrlPlaceholder')}
                className={formErrors.logoUrl ? 'border-red-500' : ''}
              />
              {formErrors.logoUrl && (
                <Form.Error>{formErrors.logoUrl}</Form.Error>
              )}
            </Form.Group>

            {/* Banner URL */}
            <Form.Group>
              <Form.Label htmlFor="bannerUrl">
                {t('bannerUrl')}
              </Form.Label>
              <Form.Control
                type="url"
                id="bannerUrl"
                name="bannerUrl"
                value={formData.bannerUrl}
                onChange={handleInputChange}
                placeholder={t('bannerUrlPlaceholder')}
                className={formErrors.bannerUrl ? 'border-red-500' : ''}
              />
              {formErrors.bannerUrl && (
                <Form.Error>{formErrors.bannerUrl}</Form.Error>
              )}
            </Form.Group>

            {/* Commission Rate */}
            <Form.Group>
              <Form.Label htmlFor="commissionRate" required>
                {t('commissionRate')}
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

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? t('saving') : (store ? t('update') : t('create'))}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StoreModal