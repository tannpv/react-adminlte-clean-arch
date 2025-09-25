import React from 'react'
import Button from '../../../shared/components/ui/Button'
import Table from '../../../shared/components/ui/Table'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'

const formatPrice = (priceCents, currency = 'USD') => {
  const value = Number(priceCents || 0) / 100
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
}

export function ProductList({ products, onEdit, onDelete }) {
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'products')
  return (
    <>
      <Table hover darkHeader>
        <Table.Header>
          <Table.HeaderCell>
            <i className="fas fa-hashtag mr-2"></i>
            {t('id', 'ID')}
          </Table.HeaderCell>
          <Table.HeaderCell>
            <i className="fas fa-barcode mr-2"></i>
            {t('sku', 'SKU')}
          </Table.HeaderCell>
          <Table.HeaderCell>
            <i className="fas fa-box mr-2"></i>
            {t('product_name', 'Product Name')}
          </Table.HeaderCell>
          <Table.HeaderCell>
            <i className="fas fa-tag mr-2"></i>
            {t('type', 'Type')}
          </Table.HeaderCell>
          <Table.HeaderCell>
            <i className="fas fa-info-circle mr-2"></i>
            {t('status', 'Status')}
          </Table.HeaderCell>
          <Table.HeaderCell>
            <i className="fas fa-tags mr-2"></i>
            {t('categories', 'Categories')}
          </Table.HeaderCell>
          <Table.HeaderCell className="text-right">
            <i className="fas fa-dollar-sign mr-2"></i>
            {t('price', 'Price')}
          </Table.HeaderCell>
          <Table.HeaderCell className="text-center">
            <i className="fas fa-cogs mr-2"></i>
            {t('actions', 'Actions')}
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
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{product.name}</span>
                    {product.description && (
                      <span className="text-sm text-gray-500">
                        {product.description.length > 60
                          ? `${product.description.substring(0, 60)}...`
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
                      {product.type || 'simple'}
                    </span>
                    {isVariable && variantCount > 0 && (
                      <span className="text-xs text-gray-500 mt-1">
                        {t('variant_count', '{{count}} variant', { count: variantCount })}
                      </span>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === 'published' ? 'bg-green-100 text-green-800' :
                    product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                    <i className={`fas ${product.status === 'published' ? 'fa-eye' :
                      product.status === 'draft' ? 'fa-edit' :
                        'fa-archive'
                      } mr-1`}></i>
                    {product.status}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-wrap gap-1">
                    {hasCategories ? (
                      <>
                        {product.categories.slice(0, 2).map((category) => (
                          <span key={`${product.id}-${category.id}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {category.name}
                          </span>
                        ))}
                        {product.categories.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{product.categories.length - 2} {t('more', 'more')}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        <i className="fas fa-minus mr-1"></i>
                        {t('no_categories', 'No categories')}
                      </span>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-medium text-gray-900">
                      {formatPrice(product.priceCents, product.currency)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {product.currency || 'USD'}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onEdit(product)}
                      title={t('edit_product', 'Edit product')}
                    >
                      <i className="fas fa-edit mr-1"></i>
                      {t('edit', 'Edit')}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(product)}
                      title={t('delete_product', 'Delete product')}
                    >
                      <i className="fas fa-trash mr-1"></i>
                      {t('delete', 'Delete')}
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>

      {products.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-box text-4xl text-gray-400 mb-4"></i>
          <h4 className="text-lg font-medium text-gray-900 mb-2">{t('no_products_found', 'No Products Found')}</h4>
          <p className="text-gray-600">
            {t('get_started_products', 'Get started by adding your first product to build your catalog.')}
          </p>
        </div>
      )}
    </>
  )
}