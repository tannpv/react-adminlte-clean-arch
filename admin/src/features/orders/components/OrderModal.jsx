import React from 'react'
import Button from '../../../shared/components/ui/Button'
import Modal from '../../../shared/components/ui/Modal'

const OrderModal = ({
    isOpen,
    onClose,
    order = null,
    onStatusChange,
    canManageOrders = false
}) => {

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

    if (!order) return null

    return (
        <Modal show={isOpen} onClose={onClose} className="max-w-4xl">
            <Modal.Header onClose={onClose}>
                <div className="flex items-center">
                    <i className="fas fa-shopping-cart mr-3 text-blue-600"></i>
                    Order Details - {order.orderNumber}
                </div>
            </Modal.Header>

            <Modal.Body>
                {/* Order Status Banner */}
                <div className="mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                                <div>
                                    <strong className="text-blue-800">Order Information:</strong>
                                    <span className="text-blue-700 ml-1">
                                        Track order status and manage fulfillment process.
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-blue-700">Status:</span>
                                {getStatusBadge(order.status)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Information */}
                    <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <i className="fas fa-receipt mr-2 text-blue-600"></i>
                                Order Information
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Order Number:</span>
                                    <span className="text-sm text-gray-900">{order.orderNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Status:</span>
                                    {getStatusBadge(order.status)}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Total:</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(order.totalAmount, order.currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Created:</span>
                                    <span className="text-sm text-gray-900">{formatDate(order.createdAt)}</span>
                                </div>
                                {order.updatedAt && order.updatedAt !== order.createdAt && (
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-500">Updated:</span>
                                        <span className="text-sm text-gray-900">{formatDate(order.updatedAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <i className="fas fa-user mr-2 text-blue-600"></i>
                                Customer Information
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Customer:</span>
                                    <span className="text-sm text-gray-900">
                                        {order.customer?.name || order.customer?.email || '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">ID:</span>
                                    <span className="text-sm text-gray-900">{order.customerId}</span>
                                </div>
                                {order.customer?.email && (
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-500">Email:</span>
                                        <span className="text-sm text-gray-900">{order.customer.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Store Information */}
                    <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <i className="fas fa-store mr-2 text-blue-600"></i>
                                Store Information
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Store:</span>
                                    <span className="text-sm text-gray-900">{order.store?.name || '-'}</span>
                                </div>
                                {order.store?.slug && (
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-500">Slug:</span>
                                        <span className="text-sm text-gray-900">/{order.store.slug}</span>
                                    </div>
                                )}
                                {order.store?.commissionRate && (
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-500">Commission:</span>
                                        <span className="text-sm text-gray-900">{order.store.commissionRate}%</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        {order.items && order.items.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <i className="fas fa-box mr-2 text-blue-600"></i>
                                    Order Items
                                </h3>
                                <div className="space-y-2">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.product?.name || item.name || `Item ${index + 1}`}
                                                </div>
                                                {item.sku && (
                                                    <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-900">
                                                    {item.quantity} × {formatCurrency(item.price || 0, order.currency)}
                                                </div>
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency((item.quantity || 0) * (item.price || 0), order.currency)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <div className="flex justify-between items-center w-full">
                    <div className="text-gray-500 text-sm">
                        <i className="fas fa-shopping-cart mr-1"></i>
                        Order management and fulfillment tracking
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="secondary"
                            outline
                            onClick={onClose}
                        >
                            <i className="fas fa-times mr-1"></i>
                            Close
                        </Button>

                        {/* Status Change Actions */}
                        {canManageOrders && order.status === 'pending' && (
                            <Button
                                variant="success"
                                onClick={() => {
                                    onStatusChange(order.id, 'processing')
                                    onClose()
                                }}
                            >
                                <i className="fas fa-play mr-1"></i>
                                Process Order
                            </Button>
                        )}

                        {canManageOrders && order.status === 'processing' && (
                            <Button
                                variant="success"
                                onClick={() => {
                                    onStatusChange(order.id, 'completed')
                                    onClose()
                                }}
                            >
                                <i className="fas fa-check mr-1"></i>
                                Complete Order
                            </Button>
                        )}

                        {canManageOrders && (order.status === 'pending' || order.status === 'processing') && (
                            <Button
                                variant="danger"
                                onClick={() => {
                                    onStatusChange(order.id, 'cancelled')
                                    onClose()
                                }}
                            >
                                <i className="fas fa-times mr-1"></i>
                                Cancel Order
                            </Button>
                        )}
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    )
}

export default OrderModal
