import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Card from '../../../shared/components/ui/Card'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { usePermissions } from '../../../shared/hooks/usePermissions'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'
import { useStores } from '../hooks/useStores'
import StoreList from '../components/StoreList'
import StoreModal from '../components/StoreModal'

const isValidationErrorMap = (err) => {
  if (!err || typeof err !== 'object' || Array.isArray(err)) return false
  return Object.values(err).every((value) => typeof value === 'string')
}

export function StoresPage() {
  const queryClient = useQueryClient()
  const { can } = usePermissions()
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'stores')

  // State management
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetStore, setTargetStore] = useState(null)
  const [editingStore, setEditingStore] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  // Permissions
  const canViewStores = can('stores:read')
  const canCreateStore = can('stores:create')
  const canUpdateStore = can('stores:update')
  const canDeleteStore = can('stores:delete')
  const canManageStoreStatus = can('stores:manage')

  // API hooks
  const {
    stores = [],
    isLoading,
    isError,
    error,
    createStoreMutation,
    updateStoreMutation,
    deleteStoreMutation,
    updateStoreStatusMutation,
    handleCreateStore,
    handleUpdateStore,
    handleDeleteStore,
    handleUpdateStoreStatus,
  } = useStores({ enabled: canViewStores, search: searchTerm })

  const submitting = createStoreMutation.isPending || updateStoreMutation.isPending

  // Calculate statistics
  const totalStores = stores.length
  const pendingStores = stores.filter(store => store.status === 'pending').length
  const approvedStores = stores.filter(store => store.status === 'approved').length
  const suspendedStores = stores.filter(store => store.status === 'suspended').length

  // Event handlers
  const handleCreateStoreClick = () => {
    setEditingStore(null)
    setFormErrors({})
    setModalOpen(true)
  }

  const handleEditStore = (store) => {
    setEditingStore(store)
    setFormErrors({})
    setModalOpen(true)
  }

  const handleDeleteStoreClick = (store) => {
    setTargetStore(store)
    setConfirmOpen(true)
  }

  const handleStatusChange = async (storeId, newStatus) => {
    try {
      const result = await handleUpdateStoreStatus(storeId, newStatus)
      if (result.success) {
        // Success handled by mutation
      } else {
        setFormErrors({ general: result.error })
      }
    } catch (error) {
      setFormErrors({ general: error.message || 'Failed to update store status' })
    }
  }

  const handleStoreSubmit = async (storeData) => {
    try {
      setFormErrors({})
      
      let result
      if (editingStore) {
        result = await handleUpdateStore(editingStore.id, storeData)
      } else {
        result = await handleCreateStore(storeData)
      }

      if (result.success) {
        setModalOpen(false)
        setEditingStore(null)
      } else {
        if (isValidationErrorMap(result.error)) {
          setFormErrors(result.error)
        } else {
          setFormErrors({ general: result.error })
        }
        throw new Error(result.error)
      }
    } catch (error) {
      // Error handling is done in the try block
    }
  }

  const handleConfirmDelete = async () => {
    if (!targetStore) return

    try {
      const result = await handleDeleteStore(targetStore.id)
      if (result.success) {
        setConfirmOpen(false)
        setTargetStore(null)
      } else {
        setFormErrors({ general: result.error })
      }
    } catch (error) {
      setFormErrors({ general: error.message || 'Failed to delete store' })
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  if (!canViewStores) {
    return (
      <div className="p-6">
        <Card>
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('accessDenied')}
            </h2>
            <p className="text-gray-600">
              {t('accessDeniedMessage')}
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('stores')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('storesDescription')}
              </p>
            </div>
            {canCreateStore && (
              <Button onClick={handleCreateStoreClick}>
                {t('createStore')}
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {totalStores}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    {t('totalStores')}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {totalStores}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-semibold text-sm">
                      {pendingStores}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    {t('pendingStores')}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {pendingStores}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">
                      {approvedStores}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    {t('approvedStores')}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {approvedStores}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-sm">
                      {suspendedStores}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    {t('suspendedStores')}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {suspendedStores}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <Card>
            <div className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder={t('searchStores')}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Error Display */}
        {isError && (
          <div className="mb-6">
            <Card>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-400">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {t('errorLoadingStores')}
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error?.message || t('unknownError')}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Stores List */}
        <StoreList
          stores={stores}
          onEdit={handleEditStore}
          onDelete={handleDeleteStoreClick}
          onStatusChange={handleStatusChange}
          isLoading={isLoading}
        />
      </div>

      {/* Store Modal */}
      <StoreModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingStore(null)
          setFormErrors({})
        }}
        onSubmit={handleStoreSubmit}
        store={editingStore}
        isLoading={submitting}
        error={formErrors.general}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false)
          setTargetStore(null)
        }}
        onConfirm={handleConfirmDelete}
        title={t('deleteStore')}
        message={t('deleteStoreConfirm', { name: targetStore?.name })}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        variant="danger"
        isLoading={deleteStoreMutation.isPending}
      />
    </>
  )
}
