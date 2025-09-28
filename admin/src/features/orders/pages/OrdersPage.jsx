import React, { useState } from 'react'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Card from '../../../shared/components/ui/Card'
import { usePermissions } from '../../../shared/hooks/usePermissions'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'
import { useOrders } from '../hooks/useOrders'

export function OrdersPage() {
  const { can } = usePermissions()
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'orders')

  // State management
  const [searchTerm, setSearchTerm] = useState('')

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
        {t(`status.${status}`)}
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString(languageCode, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat(languageCode, {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  if (!canViewOrders) {
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
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('orders')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('ordersDescription')}
            </p>
          </div>
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
                    {totalOrders}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  {t('totalOrders')}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {totalOrders}
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
                    {pendingOrders}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  {t('pendingOrders')}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {pendingOrders}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {processingOrders}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  {t('processingOrders')}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {processingOrders}
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
                    {completedOrders}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  {t('completedOrders')}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {completedOrders}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Card>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={t('searchOrders')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                    {t('errorLoadingOrders')}
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

      {/* Orders List */}
      <Card>
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-500 text-lg mb-2">
              {t('noOrdersFound')}
            </div>
            <p className="text-gray-400">
              {t('noOrdersDescription')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orderNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customer')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('store')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('total')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('createdAt')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
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
                            {t('process')}
                          </Button>
                        )}
                        
                        {canManageOrders && order.status === 'processing' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                            className="text-xs"
                          >
                            {t('complete')}
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {/* TODO: View order details */}}
                          className="text-xs"
                        >
                          {t('view')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
