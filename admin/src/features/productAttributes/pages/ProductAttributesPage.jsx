import React, { useMemo, useState } from 'react'
import { usePermissions } from '../../../shared/hooks/usePermissions'
import { useProductAttributes } from '../../products/hooks/useProductAttributes'
import { ProductAttributeList } from '../components/ProductAttributeList'
import { ProductAttributeModal } from '../components/ProductAttributeModal'
import { ProductAttributeTermsModal } from '../components/ProductAttributeTermsModal'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'

const isValidationErrorMap = (err) => {
  if (!err || typeof err !== 'object' || Array.isArray(err)) return false
  return Object.values(err).every((value) => typeof value === 'string')
}

export function ProductAttributesPage() {
  const { can } = usePermissions()
  const { attributes, isLoading, isError, error, createAttribute, updateAttribute, deleteAttribute, createTerm, updateTerm, deleteTerm, refetch } = useProductAttributes()

  const canRead = can('product-attributes:read') || can('products:read')
  const canCreate = can('product-attributes:create')
  const canUpdate = can('product-attributes:update')
  const canDelete = can('product-attributes:delete')

  const [modalOpen, setModalOpen] = useState(false)
  const [termsModal, setTermsModal] = useState({ show: false, attribute: null })
  const [confirmState, setConfirmState] = useState({ show: false, attribute: null })
  const [currentAttribute, setCurrentAttribute] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const sortedAttributes = useMemo(
    () => attributes.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [attributes],
  )

  const handleCreate = () => {
    setCurrentAttribute(null)
    setErrors({})
    setModalOpen(true)
  }

  const handleEdit = (attribute) => {
    if (!canUpdate) return
    setCurrentAttribute(attribute)
    setErrors({})
    setModalOpen(true)
  }

  const handleDelete = (attribute) => {
    if (!canDelete) return
    setConfirmState({ show: true, attribute })
  }

  const handleManageTerms = (attribute) => {
    setTermsModal({ show: true, attribute })
  }

  const closeModal = () => {
    setModalOpen(false)
    setCurrentAttribute(null)
    setErrors({})
  }

  const closeTermsModal = () => {
    setTermsModal({ show: false, attribute: null })
  }

  const closeConfirm = () => {
    setConfirmState({ show: false, attribute: null })
  }

  const submitAttribute = async (payload) => {
    setSubmitting(true)
    try {
      if (currentAttribute?.id) {
        await updateAttribute(currentAttribute.id, payload)
      } else {
        await createAttribute(payload)
      }
      closeModal()
    } catch (err) {
      if (isValidationErrorMap(err)) {
        setErrors(err)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!confirmState.attribute) return
    await deleteAttribute(confirmState.attribute.id)
    closeConfirm()
  }

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h2 className="page-title">Product Attributes</h2>
          <p className="page-subtitle">Define reusable attributes and terms for variant products.</p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-outline-secondary mr-2"
            onClick={refetch}
            disabled={isLoading}
          >
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={!canCreate}
            title={!canCreate ? 'Not allowed' : undefined}
          >
            Add Attribute
          </button>
        </div>
      </div>
      <div className="page-body">
        {!canRead && (
          <div className="alert alert-warning" role="alert">
            You do not have permission to view attributes.
          </div>
        )}
        {canRead && (
          <>
            {isLoading && <div>Loading…</div>}
            {!isLoading && isError && (
              <div className="alert alert-danger" role="alert">{error?.message || 'Failed to load attributes'}</div>
            )}
            {!isLoading && !isError && (
              <ProductAttributeList
                attributes={sortedAttributes}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onManageTerms={handleManageTerms}
              />
            )}
          </>
        )}
      </div>

      <ProductAttributeModal
        show={modalOpen}
        title={currentAttribute ? 'Edit Attribute' : 'Add Attribute'}
        initialAttribute={currentAttribute}
        errors={errors}
        submitting={submitting}
        onClose={closeModal}
        onSubmit={submitAttribute}
      />

      <ProductAttributeTermsModal
        show={termsModal.show}
        attribute={termsModal.attribute}
        submitting={submitting}
        onClose={closeTermsModal}
        onCreateTerm={async (attributeId, payload) => {
          try {
            await createTerm(attributeId, payload)
          } catch (err) {
            // TODO: surface error to UI if needed
            console.error(err)
          }
        }}
        onUpdateTerm={async (attributeId, termId, payload) => {
          try {
            await updateTerm(attributeId, termId, payload)
          } catch (err) {
            console.error(err)
          }
        }}
        onDeleteTerm={async (attributeId, termId) => {
          try {
            await deleteTerm(attributeId, termId)
          } catch (err) {
            console.error(err)
          }
        }}
      />

      <ConfirmModal
        show={confirmState.show}
        title="Delete Attribute"
        message={`Are you sure you want to delete ${confirmState.attribute?.name || 'this attribute'}?`}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={closeConfirm}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
