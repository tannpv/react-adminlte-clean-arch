import { useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import Button from '../../../shared/components/ui/Button'
import Card from '../../../shared/components/ui/Card'
import { usePermissions } from '../../../shared/hooks/usePermissions'
import StoreList from '../components/StoreList'
import StoreModal from '../components/StoreModal'
import { useStores } from '../hooks/useStores'

const isValidationErrorMap = (err) => {
  if (!err || typeof err !== 'object' || Array.isArray(err)) return false
  return Object.values(err).every((value) => typeof value === 'string')
}

export function StoresPage() {
  const queryClient = useQueryClient()
  const { can } = usePermissions()

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
              Access Denied
            </h2>
            <p className="text-gray-600">
              You do not have permission to access this page.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <i className="fas fa-store mr-3 text-blue-600"></i>
                Stores
              </h1>
              <p className="mt-2 text-gray-600 max-w-2xl">
                Manage multi-seller stores, approve applications, and monitor store performance.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {canCreateStore && (
                <Button
                  variant="primary"
                  onClick={handleCreateStoreClick}
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add New Store
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <Card.Body>
              <div className="text-center py-12">
                <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Loading Stores</h4>
                <p className="text-gray-600">Please wait while we fetch your stores...</p>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <Card>
            <Card.Body>
              <div className="text-center py-12">
                <i className="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Stores</h4>
                <p className="text-gray-600 mb-6">
                  {error?.message || 'An unexpected error occurred while loading stores.'}
                </p>
                <Button
                  variant="outline-primary"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-redo mr-2"></i>
                  Try Again
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Stores Content */}
        {!isLoading && !isError && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <i className="fas fa-store text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold">{totalStores}</div>
                    <div className="text-blue-100">Total Stores</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                <div className="flex items-center">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <i className="fas fa-clock text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold">{pendingStores}</div>
                    <div className="text-yellow-100">Pending</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <i className="fas fa-check-circle text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold">{approvedStores}</div>
                    <div className="text-green-100">Approved</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                <div className="flex items-center">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                    <i className="fas fa-ban text-2xl"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-3xl font-bold">{suspendedStores}</div>
                    <div className="text-red-100">Suspended</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <input
                  type="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search stores by name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {/* Stores List Section */}
            <Card>
              <Card.Header>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <i className="fas fa-list mr-2 text-blue-600"></i>
                      Store Management
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Manage your multi-seller stores, approve applications, and monitor performance.
                      {searchTerm && ` Showing results for "${searchTerm}"`}
                    </p>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <StoreList
                  stores={stores}
                  onEdit={handleEditStore}
                  onDelete={handleDeleteStoreClick}
                  onStatusChange={handleStatusChange}
                  isLoading={isLoading}
                />
              </Card.Body>
            </Card>
          </div>
        )}
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
        title='Delete Store'
        message={`Are you sure you want to delete ${targetStore?.name}?`}
        confirmText='Delete'
        cancelText='Cancel'
        variant="danger"
        isLoading={deleteStoreMutation.isPending}
      />
    </>
  )
}
