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
                aria-labelledby="directoryModalTitle"
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title" id="directoryModalTitle">
                                <i className="fas fa-folder-plus mr-2"></i>
                                {title}
                            </h5>
                            <button
                                type="button"
                                className="close text-white"
                                aria-label="Close"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="container-fluid">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="alert alert-info" role="alert">
                                                <i className="fas fa-info-circle mr-2"></i>
                                                <strong>Create Directory:</strong> Enter a name for your new folder.
                                                The name will be used to organize your files.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <div className="form-group">
                                            <label className="form-label">
                                                <i className="fas fa-folder mr-2"></i>
                                                Directory Name
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${nameError ? 'is-invalid' : ''}`}
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter directory name (e.g., Documents, Images)"
                                                required
                                                disabled={submitting}
                                                autoFocus
                                            />
                                            {nameError && (
                                                <div className="invalid-feedback">
                                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                                    {nameError}
                                                </div>
                                            )}
                                            <small className="form-text text-muted">
                                                <i className="fas fa-lightbulb mr-1"></i>
                                                Use descriptive names to organize your files effectively.
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer bg-light border-top">
                                <div className="d-flex justify-content-between w-100">
                                    <div className="text-muted">
                                        <small>
                                            <i className="fas fa-folder mr-1"></i>
                                            Directory will be created in the current location
                                        </small>
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary mr-2"
                                            onClick={onClose}
                                            disabled={submitting}
                                        >
                                            <i className="fas fa-times mr-1"></i>
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-success"
                                            disabled={submitting || !name.trim()}
                                        >
                                            {submitting ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin mr-1"></i>
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-folder-plus mr-1"></i>
                                                    Create Directory
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {show && <div className="modal-backdrop fade show" />}
        </>
    )
}