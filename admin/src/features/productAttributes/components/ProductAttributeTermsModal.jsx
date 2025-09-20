import React, { useEffect, useState } from 'react'

const buildEmptyTerm = () => ({
  id: null,
  name: '',
  slug: '',
  order: 0,
  metadata: null,
})

export function ProductAttributeTermsModal({
  show,
  attribute,
  submitting = false,
  onClose,
  onCreateTerm,
  onUpdateTerm,
  onDeleteTerm,
}) {
  const [draftTerms, setDraftTerms] = useState([])
  const [dirtyMap, setDirtyMap] = useState(new Set())

  useEffect(() => {
    if (!show || !attribute) return
    setDraftTerms((attribute.terms || []).map((term) => ({ ...term, sort_order: term.order ?? 0 })))
    setDirtyMap(new Set())
  }, [attribute, show])

  const updateTermField = (index, patch) => {
    setDraftTerms((prev) => prev.map((term, idx) => (idx === index ? { ...term, ...patch } : term)))
    setDirtyMap((prev) => new Set(prev).add(index))
  }

  const handleSaveTerm = async (index) => {
    const term = draftTerms[index]
    if (!term.name.trim() || !term.slug.trim()) return
    const payload = {
      name: term.name.trim(),
      slug: term.slug.trim(),
      metadata: term.metadata ?? null,
      sortOrder: Number(term.order) || 0,
    }
    if (term.id) {
      await onUpdateTerm(attribute.id, term.id, payload)
    } else {
      await onCreateTerm(attribute.id, payload)
    }
    setDirtyMap((prev) => {
      const next = new Set(prev)
      next.delete(index)
      return next
    })
  }

  const handleDeleteTerm = async (index) => {
    const term = draftTerms[index]
    if (term.id) {
      await onDeleteTerm(attribute.id, term.id)
    }
    setDraftTerms((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleAddTerm = () => {
    setDraftTerms((prev) => [...prev, buildEmptyTerm()])
  }

  if (!show || !attribute) return null

  return (
    <>
      <div className={`modal fade ${show ? 'show' : ''}`} style={{ display: show ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-modal={show ? 'true' : undefined}>
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Manage Terms – {attribute.name}</h5>
              <button type="button" className="close" onClick={onClose} disabled={submitting}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Terms</h6>
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleAddTerm} disabled={submitting}>
                  Add Term
                </button>
              </div>
              {draftTerms.length === 0 ? (
                <p className="text-muted mb-0">No terms defined.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Slug</th>
                        <th style={{ width: 100 }}>Order</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draftTerms.map((term, index) => {
                        const isDirty = dirtyMap.has(index)
                        return (
                          <tr key={index}>
                            <td>
                              <input
                                className="form-control form-control-sm"
                                value={term.name}
                                onChange={(e) => updateTermField(index, { name: e.target.value })}
                                disabled={submitting}
                              />
                            </td>
                            <td>
                              <input
                                className="form-control form-control-sm"
                                value={term.slug}
                                onChange={(e) => updateTermField(index, { slug: e.target.value })}
                                disabled={submitting}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={term.order ?? 0}
                                onChange={(e) => updateTermField(index, { order: Number(e.target.value) })}
                                disabled={submitting}
                              />
                            </td>
                            <td className="text-nowrap">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary mr-2"
                                onClick={() => handleSaveTerm(index)}
                                disabled={submitting || !isDirty}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteTerm(index)}
                                disabled={submitting}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show" />}
    </>
  )
}
