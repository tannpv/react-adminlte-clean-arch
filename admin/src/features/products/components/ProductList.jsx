import React from 'react'
import Button from '../../../shared/components/ui/Button'
import Table from '../../../shared/components/ui/Table'

const formatPrice = (priceCents, currency = 'USD') => {
  const value = Number(priceCents || 0) / 100
  const validCurrency = currency && currency.trim() !== '' ? currency : 'USD'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: validCurrency }).format(value)
}

export function ProductList({ products, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <Table hover darkHeader>
        <Table.Header>
          <Table.HeaderCell>
            <i className="fas fa-hashtag mr-2"></i>
            ID
          </Table.HeaderCell>
          <Table.HeaderCell>
            <i className="fas fa-barcode mr-2"></i>
            SKU
          </Table.HeaderCell>
          <Table.HeaderCell>
            <i className="fas fa-box mr-2"></i>
            Product Name
          </Table.HeaderCell>
          <Table.HeaderCell>
            <i className="fas fa-tag mr-2"></i>
            Type
          </Table.HeaderCell>
          <Table.HeaderCell>
            <i className="fas fa-dollar-sign mr-2"></i>
            Price
          </Table.HeaderCell>
          <Table.HeaderCell className="text-center">
            <i className="fas fa-cogs mr-2"></i>
            Actions
          </Table.HeaderCell>
        </Table.Header>
        <Table.Body>
          {products.map((product) => {
            const isVariable = product.type === 'variable'
            const variantCount = isVariable && Array.isArray(product.variants) ? product.variants.length : 0
            const hasCategories = Array.isArray(product.categories) && product.categories.length > 0

            return (
              <Table.Row key={product.id}>
                <Table.Cell className="font-medium text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {product.id}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                    {product.sku}
                  </code>
                </Table.Cell>
                <Table.Cell>
                  <div className="max-w-xs">
                    <span className="font-semibold text-gray-900 text-base block truncate" title={product.name}>
                      {product.name}
                    </span>
                    {product.description && (
                      <span className="text-xs text-gray-400 mt-1 block truncate" title={product.description}>
                        {product.description.length > 30
                          ? `${product.description.substring(0, 30)}...`
                          : product.description
                        }
                      </span>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-col">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isVariable ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      <i className={`fas ${isVariable ? 'fa-cogs' : 'fa-box'} mr-1`}></i>
                      {product.type}
                    </span>
                    {isVariable && variantCount > 0 && (
                      <span className="text-xs text-gray-500 mt-1">
                        {variantCount} variant{variantCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                      {formatPrice(product.priceCents, product.currency)}
                    </span>
                    {product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents && (
                      <span className="text-xs text-gray-500 line-through">
                        {formatPrice(product.compareAtPriceCents, product.currency)}
                      </span>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onEdit(product)}
                      title="Edit product"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(product.id)}
                      title="Delete product"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            )
          })}
          {products.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center py-12">
                <i className="fas fa-box text-4xl text-gray-400 mb-4"></i>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h4>
                <p className="text-gray-600">
                  Get started by adding your first product to build your catalog.
                </p>
              </td>
            </tr>
          )}
        </Table.Body>
      </Table>
    </div>
  )
}

export default ProductList;