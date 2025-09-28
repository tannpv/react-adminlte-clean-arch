import React from 'react'
import Button from '../../../shared/components/ui/Button'
import Card from '../../../shared/components/ui/Card'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'

const StoreList = ({ 
  stores = [], 
  onEdit, 
  onDelete, 
  onStatusChange,
  isLoading = false 
}) => {
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'stores')

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      rejected: 'bg-gray-100 text-gray-800'
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

  if (isLoading) {
    return (
      <Card>
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
      </Card>
    )
  }

  if (stores.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center">
          <div className="text-gray-500 text-lg mb-2">
            {t('noStoresFound')}
          </div>
          <p className="text-gray-400">
            {t('noStoresDescription')}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('store')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('owner')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('commission')}
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
            {stores.map((store) => (
              <tr key={store.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {store.logoUrl && (
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={store.logoUrl}
                          alt={store.name}
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {store.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        /{store.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {store.user?.name || store.user?.email || '-'}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {store.userId}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(store.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {store.commissionRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(store.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {/* Status Actions */}
                    {store.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => onStatusChange(store.id, 'approved')}
                          className="text-xs"
                        >
                          {t('approve')}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => onStatusChange(store.id, 'rejected')}
                          className="text-xs"
                        >
                          {t('reject')}
                        </Button>
                      </>
                    )}
                    
                    {store.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => onStatusChange(store.id, 'suspended')}
                        className="text-xs"
                      >
                        {t('suspend')}
                      </Button>
                    )}

                    {store.status === 'suspended' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => onStatusChange(store.id, 'approved')}
                        className="text-xs"
                      >
                        {t('reactivate')}
                      </Button>
                    )}

                    {/* Edit Action */}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onEdit(store)}
                      className="text-xs"
                    >
                      {t('edit')}
                    </Button>

                    {/* Delete Action */}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(store)}
                      className="text-xs"
                    >
                      {t('delete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default StoreList
