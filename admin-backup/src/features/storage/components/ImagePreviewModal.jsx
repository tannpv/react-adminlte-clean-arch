import React from 'react'

export function ImagePreviewModal({ show, imageUrl, imageName, onClose }) {
    if (!show) return null

    return (
        <>
            <div
                className="modal fade show"
                style={{ display: 'block' }}
                tabIndex="-1"
                role="dialog"
                aria-modal="true"
                onClick={onClose}
            >
                <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h5 className="modal-title">{imageName}</h5>
                            <button
                                type="button"
                                className="close"
                                aria-label="Close"
                                onClick={onClose}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body text-center p-0">
                            <img
                                src={imageUrl}
                                alt={imageName}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    objectFit: 'contain',
                                    borderRadius: '8px'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'block'
                                }}
                            />
                            <div
                                className="alert alert-warning m-3"
                                style={{ display: 'none' }}
                            >
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                Failed to load image
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => window.open(imageUrl, '_blank')}
                            >
                                <i className="fas fa-external-link-alt mr-1"></i>
                                Open in New Tab
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" onClick={onClose} />
        </>
    )
}

