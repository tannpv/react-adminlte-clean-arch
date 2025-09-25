import React from 'react'
import Button from '../../../shared/components/ui/Button'
import Table from '../../../shared/components/ui/Table'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'

export function CategoryList({ categories, onEdit, onDelete, canEdit = true, canDelete = true }) {
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'categories')
  return (
    <>
      <Table hover darkHeader>
        <Table.Header>
          <Table.HeaderCell>
            <i className="fas fa-hashtag mr-2"></i>
            {t('id', 'ID')}
          </Table.HeaderCell>
          <Table.HeaderCell>
            <i className="fas fa-tag mr-2"></i>
            {t('category_name', 'Category Name')}
          </Table.HeaderCell>
          <Table.HeaderCell>
            <i className="fas fa-sitemap mr-2"></i>
            {t('parent_category', 'Parent Category')}
          </Table.HeaderCell>
          <Table.HeaderCell>
            <i className="fas fa-layer-group mr-2"></i>
            {t('hierarchy', 'Hierarchy')}
          </Table.HeaderCell>
          <Table.HeaderCell className="text-center">
            <i className="fas fa-cogs mr-2"></i>
            {t('actions', 'Actions')}
          </Table.HeaderCell>
        </Table.Header>
        <Table.Body>
          {categories.map(category => {
            const isRootCategory = !category.parentId
            const depth = category.depth || 0

            return (
              <Table.Row key={category.id}>
                <Table.Cell className="font-medium text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {category.id}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900 text-base">{category.name}</span>
                      {isRootCategory && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <i className="fas fa-folder mr-1"></i>
                          {t('root', 'Root')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">
                      {isRootCategory ? t('top_level_category', 'Top-level category') : t('subcategory_level', 'Subcategory (Level {{depth}})', { depth })}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center">
                    {category.parentName ? (
                      <>
                        <i className="fas fa-folder mr-2 text-gray-400"></i>
                        <span className="text-gray-700">{category.parentName}</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-minus mr-2 text-gray-400"></i>
                        <span className="text-gray-500">{t('no_parent', 'No parent')}</span>
                      </>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center">
                    {depth > 0 && (
                      <div className="flex items-center mr-2">
                        {Array.from({ length: depth }, (_, i) => (
                          <i key={i} className="fas fa-chevron-right text-gray-400 text-xs"></i>
                        ))}
                      </div>
                    )}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <i className="fas fa-layer-group mr-1"></i>
                      {t('level', 'Level')} {depth}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => { if (canEdit) onEdit(category) }}
                      disabled={!canEdit}
                      title={t('edit_category', 'Edit category')}
                    >
                      <i className="fas fa-edit mr-1"></i>
                      {t('edit', 'Edit')}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => { if (canDelete) onDelete(category.id) }}
                      disabled={!canDelete}
                      title={t('delete_category', 'Delete category')}
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

      {categories.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-tags text-4xl text-gray-400 mb-4"></i>
          <h4 className="text-lg font-medium text-gray-900 mb-2">{t('no_categories_found', 'No Categories Found')}</h4>
          <p className="text-gray-600">
            {t('get_started_categories', 'Get started by creating your first product category to organize your inventory.')}
          </p>
        </div>
      )}
    </>
  )
}