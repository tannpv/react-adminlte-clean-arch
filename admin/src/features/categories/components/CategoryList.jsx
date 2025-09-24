import React from 'react'
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation'

export function CategoryList({ categories, onEdit, onDelete, canEdit = true, canDelete = true }) {
  const { languageCode } = useLanguage()
  const { t } = useTranslation(languageCode, 'categories')
  return (
    <div className="categories-list-container">
      <div className="table-responsive">
        <table className="table table-hover categories-table align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th className="category-id-column">
                <i className="fas fa-hashtag mr-2"></i>
                {t('id', 'ID')}
              </th>
              <th className="category-name-column">
                <i className="fas fa-tag mr-2"></i>
                {t('category_name', 'Category Name')}
              </th>
              <th className="category-parent-column">
                <i className="fas fa-sitemap mr-2"></i>
                {t('parent_category', 'Parent Category')}
              </th>
              <th className="category-hierarchy-column">
                <i className="fas fa-layer-group mr-2"></i>
                {t('hierarchy', 'Hierarchy')}
              </th>
              <th className="category-actions-column text-center">
                <i className="fas fa-cogs mr-2"></i>
                {t('actions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => {
              const isRootCategory = !category.parentId
              const depth = category.depth || 0

              return (
                <tr key={category.id} className="category-row">
                  <td className="category-id-cell">
                    <span className="category-id-badge">{category.id}</span>
                  </td>
                  <td className="category-name-cell">
                    <div className="category-name-info">
                      <div className="category-name">
                        <strong>{category.name}</strong>
                        {isRootCategory && (
                          <span className="badge badge-info ml-2">
                            <i className="fas fa-folder mr-1"></i>
                            {t('root', 'Root')}
                          </span>
                        )}
                      </div>
                      <small className="text-muted">
                        {isRootCategory ? t('top_level_category', 'Top-level category') : t('subcategory_level', 'Subcategory (Level {{depth}})', { depth })}
                      </small>
                    </div>
                  </td>
                  <td className="category-parent-cell">
                    <div className="parent-category">
                      {category.parentName ? (
                        <div className="parent-info">
                          <i className="fas fa-folder mr-2 text-muted"></i>
                          <span className="parent-name">{category.parentName}</span>
                        </div>
                      ) : (
                        <span className="no-parent">
                          <i className="fas fa-minus mr-2 text-muted"></i>
                          <span className="text-muted">{t('no_parent', 'No parent')}</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="category-hierarchy-cell">
                    <div className="hierarchy-indicator">
                      {depth > 0 && (
                        <div className="hierarchy-levels">
                          {Array.from({ length: depth }, (_, i) => (
                            <span key={i} className="hierarchy-level">
                              <i className="fas fa-chevron-right"></i>
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="hierarchy-badge">
                        <i className="fas fa-layer-group mr-1"></i>
                        {t('level', 'Level')} {depth}
                      </span>
                    </div>
                  </td>
                  <td className="category-actions-cell text-center">
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-outline-primary mr-2"
                        onClick={() => { if (canEdit) onEdit(category) }}
                        disabled={!canEdit}
                        title={t('edit_category', 'Edit category')}
                      >
                        <i className="fas fa-edit mr-1"></i>
                        {t('edit', 'Edit')}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => { if (canDelete) onDelete(category.id) }}
                        disabled={!canDelete}
                        title={t('delete_category', 'Delete category')}
                      >
                        <i className="fas fa-trash mr-1"></i>
                        {t('delete', 'Delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-content">
            <i className="fas fa-tags empty-state-icon"></i>
            <h4 className="empty-state-title">{t('no_categories_found', 'No Categories Found')}</h4>
            <p className="empty-state-description">
              {t('get_started_categories', 'Get started by creating your first product category to organize your inventory.')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}