import React from 'react'
import { formatFileSize, getFileDisplayType, getFileIcon, getFullFileUrl, isImageFile } from '../../../shared/lib/fileUtils'

export function StorageList({ items, onEnterDirectory, onDelete, onToggleVisibility, loading, error }) {
    if (loading) {
        return <div className="p-4 text-muted">Loading...</div>
    }

    if (error) {
        return <div className="p-4 text-danger">{error?.message || 'Failed to load'}</div>
    }

    if (items.length === 0) {
        return <div className="p-4 text-muted">Empty</div>
    }

    return (
        <table className="table table-hover mb-0">
            <thead>
                <tr>
                    <th style={{ width: 50 }}></th>
                    <th>Name</th>
                    <th style={{ width: 100 }}>Type</th>
                    <th style={{ width: 100 }}>Size</th>
                    <th style={{ width: 100 }}>Visibility</th>
                    <th style={{ width: 120 }}></th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => {
                    const isImage = item.type === 'file' && isImageFile(item.mimeType, item.originalName)
                    const fileIcon = item.type === 'file' ? getFileIcon(item.mimeType, item.originalName) : 'fas fa-folder'
                    const fileSize = item.type === 'file' ? formatFileSize(item.sizeBytes) : '-'
                    const fileType = getFileDisplayType(item.type, item.originalName)
                    const fullImageUrl = isImage && item.url ? getFullFileUrl(item.url) : null

                    return (
                        <tr key={`${item.type}-${item.id}`}>
                            <td className="text-center align-middle">
                                {isImage && fullImageUrl ? (
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <img
                                            src={fullImageUrl}
                                            alt={item.displayName || item.originalName}
                                            style={{
                                                width: 40,
                                                height: 40,
                                                objectFit: 'cover',
                                                borderRadius: '6px',
                                                border: '2px solid #dee2e6',
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s ease'
                                            }}
                                            onError={(e) => {
                                                // Fallback to icon if image fails to load
                                                e.target.style.display = 'none'
                                                e.target.nextSibling.style.display = 'inline'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'scale(1.1)'
                                                e.target.style.borderColor = '#007bff'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'scale(1)'
                                                e.target.style.borderColor = '#dee2e6'
                                            }}
                                            onClick={() => {
                                                // Open image in new tab for full view
                                                window.open(fullImageUrl, '_blank')
                                            }}
                                            title={`Click to view full size: ${item.displayName || item.originalName}`}
                                        />
                                        <i
                                            className={fileIcon}
                                            style={{
                                                display: 'none',
                                                fontSize: '16px',
                                                color: '#6c757d'
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <i
                                        className={fileIcon}
                                        style={{
                                            fontSize: '18px',
                                            color: item.type === 'directory' ? '#ffc107' : '#6c757d'
                                        }}
                                    />
                                )}
                            </td>
                            <td className="align-middle">
                                {item.type === 'directory' ? (
                                    <a href="#" onClick={(e) => { e.preventDefault(); onEnterDirectory(item.id) }}>
                                        {item.name}
                                    </a>
                                ) : (
                                    <span>{item.displayName || item.originalName}</span>
                                )}
                            </td>
                            <td className="align-middle">
                                <span className="text-capitalize">{fileType}</span>
                            </td>
                            <td className="align-middle">
                                <small className="text-muted">{fileSize}</small>
                            </td>
                            <td className="align-middle text-capitalize">{item.visibility || '-'}</td>
                            <td className="align-middle text-right">
                                {item.type === 'file' ? (
                                    <button
                                        className="btn btn-sm btn-outline-secondary mr-2"
                                        title="Toggle visibility"
                                        onClick={() => onToggleVisibility(item)}
                                    >
                                        <i className={`fas ${item.visibility === 'public' ? 'fa-lock-open' : 'fa-lock'}`} />
                                    </button>
                                ) : null}
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => onDelete(item)}
                                >
                                    <i className="fas fa-trash" />
                                </button>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}
