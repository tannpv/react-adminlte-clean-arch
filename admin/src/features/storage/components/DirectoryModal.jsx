import React, { useEffect, useState } from 'react'

export function DirectoryModal({ show, title, onClose, onSubmit, errors = {}, submitting = false }) {
    const [name, setName] = useState('')

    useEffect(() => {
        if (show) {
            setName('')
        }
    }, [show])

    const handleSubmit = (e) => {
        e.preventDefault()
        const trimmedName = name.trim()
        if (trimmedName) {
            onSubmit({ name: trimmedName })
        }
    }

    const nameError = typeof errors.name === 'string' ? errors.name : errors.name?.message

    return (
        <>
            <div
                className={`modal fade ${show ? 'show' : ''}`}
                style={{ display: show ? 'block' : 'none' }}
                tabIndex="-1"
                role="dialog"
                aria-modal={show ? 'true' : undefined}
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button type="button" className="close" aria-label="Close" onClick={onClose}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Directory Name</label>
                                    <input
                                        type="text"
                                        className={`form-control ${nameError ? 'is-invalid' : ''}`}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter directory name"
                                        required
                                        disabled={submitting}
                                        autoFocus
                                    />
                                    {nameError && <div className="invalid-feedback">{nameError}</div>}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting || !name.trim()}>
                                    {submitting ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {show && <div className="modal-backdrop fade show" />}
        </>
    )
}

