import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logoUrl: '',
      bannerUrl: '',
      commissionRate: 10.00
    }
  })

  const watchedName = watch('name')

  // Auto-generate slug from name
  useEffect(() => {
    if (watchedName && !store) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setValue('slug', slug)
    }
  }, [watchedName, setValue, store])

  // Reset form when modal opens/closes or store changes
  useEffect(() => {
    if (isOpen) {
      if (store) {
        reset({
          name: store.name || '',
          slug: store.slug || '',
          description: store.description || '',
          logoUrl: store.logoUrl || '',
          bannerUrl: store.bannerUrl || '',
          commissionRate: store.commissionRate || 10.00
        })
      } else {
        reset({
          name: '',
          slug: '',
          description: '',
          logoUrl: '',
          bannerUrl: '',
          commissionRate: 10.00
        })
      }
      setFormErrors({})
    }
  }, [isOpen, store, reset])

  const handleFormSubmit = async (data) => {
    try {
      setFormErrors({})
      await onSubmit(data)
      onClose()
    } catch (error) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors)
      } else {
        setFormErrors({ general: error.message || 'An error occurred' })
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {store ? t('editStore') : t('createStore')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={isLoading}
            >
              ×
            </button>
          </div>

          {/* General Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Store Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('storeName')} *
              </label>
              <Form.Control
                {...register('name', { 
                  required: t('storeNameRequired'),
                  minLength: { value: 2, message: t('storeNameMinLength') }
                })}
                placeholder={t('storeNamePlaceholder')}
                className={errors.name ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* Store Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('storeSlug')} *
              </label>
              <Form.Control
                {...register('slug', { 
                  required: t('storeSlugRequired'),
                  pattern: {
                    value: /^[a-z0-9-]+$/,
                    message: t('storeSlugPattern')
                  }
                })}
                placeholder={t('storeSlugPlaceholder')}
                className={errors.slug ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.slug && (
                <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
              )}
              {formErrors.slug && (
                <p className="text-red-500 text-sm mt-1">{formErrors.slug}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {t('storeSlugHelp')}
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('description')}
              </label>
              <Form.Textarea
                {...register('description')}
                placeholder={t('descriptionPlaceholder')}
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
              {formErrors.description && (
                <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
              )}
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('logoUrl')}
              </label>
              <Form.Control
                {...register('logoUrl', {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: t('logoUrlPattern')
                  }
                })}
                placeholder={t('logoUrlPlaceholder')}
                className={errors.logoUrl ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.logoUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.logoUrl.message}</p>
              )}
              {formErrors.logoUrl && (
                <p className="text-red-500 text-sm mt-1">{formErrors.logoUrl}</p>
              )}
            </div>

            {/* Banner URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('bannerUrl')}
              </label>
              <Form.Control
                {...register('bannerUrl', {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: t('bannerUrlPattern')
                  }
                })}
                placeholder={t('bannerUrlPlaceholder')}
                className={errors.bannerUrl ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.bannerUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.bannerUrl.message}</p>
              )}
              {formErrors.bannerUrl && (
                <p className="text-red-500 text-sm mt-1">{formErrors.bannerUrl}</p>
              )}
            </div>

            {/* Commission Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('commissionRate')} (%)
              </label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register('commissionRate', {
                  required: t('commissionRateRequired'),
                  min: { value: 0, message: t('commissionRateMin') },
                  max: { value: 100, message: t('commissionRateMax') }
                })}
                placeholder="10.00"
                className={errors.commissionRate ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.commissionRate && (
                <p className="text-red-500 text-sm mt-1">{errors.commissionRate.message}</p>
              )}
              {formErrors.commissionRate && (
                <p className="text-red-500 text-sm mt-1">{formErrors.commissionRate}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
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
                disabled={isLoading}
                className="min-w-[100px]"
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
