import React, { useState } from 'react'
import Button from '../../../shared/components/ui/Button'
import Card from '../../../shared/components/ui/Card'
import { usePermissions } from '../../../shared/hooks/usePermissions'
import OrderModal from '../components/OrderModal'
import { useOrders } from '../hooks/useOrders'

export function OrdersPage() {
  const { can } = usePermissions()

  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Permissions
  const canViewOrders = can('orders:read')
  const canManageOrders = can('orders:manage')

  // API hooks
  const {
    orders = [],
    isLoading,
    isError,
    error,
    handleUpdateOrderStatus,
  } = useOrders({ enabled: canViewOrders, search: searchTerm })

  // Calculate statistics
  const totalOrders = orders.length
  const pendingOrders = orders.filter(order => order.status === 'pending').length
  const processingOrders = orders.filter(order => order.status === 'processing').length
  const completedOrders = orders.filter(order => order.status === 'completed').length

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount, currency = 'USD') => {
    const validCurrency = currency && currency.trim() !== '' ? currency : 'USD'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: validCurrency
    }).format(amount)
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedOrder(null)
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const result = await handleUpdateOrderStatus(orderId, newStatus)
      if (result.success) {
        // Success handled by mutation
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  if (!canViewOrders) {
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
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-shopping-cart mr-3 text-blue-600"></i>
              Orders
            </h1>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Manage orders across all stores, track fulfillment, and monitor order status.
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <Card.Body>
            <div className="text-center py-12">
              <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Loading Orders</h4>
              <p className="text-gray-600">Please wait while we fetch your orders...</p>
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
              <h4 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Orders</h4>
              <p className="text-gray-600 mb-6">
                {error?.message || 'An unexpected error occurred while loading orders.'}
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

      {/* Orders Content */}
      {!isLoading && !isError && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <i className="fas fa-shopping-cart text-2xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-3xl font-bold">{totalOrders}</div>
                  <div className="text-blue-100">Total Orders</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <i className="fas fa-clock text-2xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-3xl font-bold">{pendingOrders}</div>
                  <div className="text-yellow-100">Pending</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <i className="fas fa-cogs text-2xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-3xl font-bold">{processingOrders}</div>
                  <div className="text-purple-100">Processing</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <i className="fas fa-check-circle text-2xl"></i>
                </div>
                <div className="ml-4">
                  <div className="text-3xl font-bold">{completedOrders}</div>
                  <div className="text-green-100">Completed</div>
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
                placeholder="Search orders by number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Orders List Section */}
          <Card>
            <Card.Header>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <i className="fas fa-list mr-2 text-blue-600"></i>
                    Order Management
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Manage orders across all stores, track fulfillment, and monitor order status.
                    {searchTerm && ` Showing results for "${searchTerm}"`}
                  </p>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-shopping-cart text-4xl text-gray-400 mb-4"></i>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No Orders Found
                  </h4>
                  <p className="text-gray-600">
                    No orders match your current search criteria.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Store
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {order.customer?.name || order.customer?.email || '-'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {order.customerId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {order.store?.name || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(order.totalAmount, order.currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              {canManageOrders && order.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                                  className="text-xs"
                                >
                                  Process
                                </Button>
                              )}

                              {canManageOrders && order.status === 'processing' && (
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                  className="text-xs"
                                >
                                  Complete
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleViewOrder(order)}
                                className="text-xs"
                              >
                                <i className="fas fa-eye mr-1"></i>
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Order Modal */}
      <OrderModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
        canManageOrders={canManageOrders}
      />
    </div>
  )
}
