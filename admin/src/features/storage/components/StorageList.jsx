import React, { useState } from 'react'
import { formatFileSize, getFileDisplayType, getFileIcon, getFullFileUrl, isImageFile } from '../../../shared/lib/fileUtils'
import { ImagePreviewModal } from './ImagePreviewModal'

export function StorageList({
    items,
    onEnterDirectory,
    onDelete,
    onToggleVisibility,
    onUpdateDisplayName,
    loading,
    error,
    canUpdate = true,
    canDelete = true,
}) {
    const [editingId, setEditingId] = useState(null)
    const [editValue, setEditValue] = useState('')
    const [previewImage, setPreviewImage] = useState(null)

    const handleStartEdit = (item) => {
        if (!canUpdate || !onUpdateDisplayName || item.type !== 'file') {
            return
        }
        setEditingId(item.id)
        setEditValue(item.displayName || item.originalName || '')
    }

    const handleSaveEdit = async (item) => {
        if (!canUpdate || !onUpdateDisplayName) {
            setEditingId(null)
            setEditValue('')
            return
        }
        const trimmedValue = editValue.trim()
        if (trimmedValue && trimmedValue !== (item.displayName || item.originalName)) {
            await onUpdateDisplayName(item.id, trimmedValue)
        }
        setEditingId(null)
        setEditValue('')
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditValue('')
    }

    const handleKeyPress = (e, item) => {
        if (e.key === 'Enter') {
            handleSaveEdit(item)
        } else if (e.key === 'Escape') {
            handleCancelEdit()
        }
    }

    const handleImageClick = (item) => {
        setPreviewImage({
            url: getFullFileUrl(item.url),
            name: item.displayName || item.originalName
        })
    }

    const handleClosePreview = () => {
        setPreviewImage(null)
    }

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
        <>
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
                                                onClick={() => handleImageClick(item)}
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
                                    ) : (canUpdate && onUpdateDisplayName && editingId === item.id) ? (
                                        <div className="d-flex align-items-center">
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyDown={(e) => handleKeyPress(e, item)}
                                                onBlur={() => handleSaveEdit(item)}
                                                autoFocus
                                                style={{ width: '200px' }}
                                            />
                                            <button
                                                className="btn btn-sm btn-success ml-1"
                                                onClick={() => handleSaveEdit(item)}
                                                title="Save"
                                            >
                                                <i className="fas fa-check" />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-secondary ml-1"
                                                onClick={handleCancelEdit}
                                                title="Cancel"
                                            >
                                                <i className="fas fa-times" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="d-flex align-items-center">
                                            <span
                                                className="flex-grow-1"
                                                style={{ cursor: canUpdate && onUpdateDisplayName ? 'pointer' : 'default' }}
                                                onClick={() => handleStartEdit(item)}
                                                title={canUpdate && onUpdateDisplayName ? 'Click to edit display name' : undefined}
                                            >
                                                {item.displayName || item.originalName}
                                            </span>
                                            {canUpdate && onUpdateDisplayName && (
                                                <button
                                                    className="btn btn-sm btn-outline-primary ml-2"
                                                    onClick={() => handleStartEdit(item)}
                                                    title="Edit display name"
                                                >
                                                    <i className="fas fa-edit" />
                                                </button>
                                            )}
                                        </div>
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
                                    {item.type === 'file' && canUpdate && onToggleVisibility ? (
                                        <button
                                            className="btn btn-sm btn-outline-secondary mr-2"
                                            title="Toggle visibility"
                                            onClick={() => onToggleVisibility(item)}
                                        >
                                            <i className={`fas ${item.visibility === 'public' ? 'fa-lock-open' : 'fa-lock'}`} />
                                        </button>
                                    ) : null}
                                    {canDelete && onDelete && (
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => onDelete(item)}
                                        >
                                            <i className="fas fa-trash" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            <ImagePreviewModal
                show={!!previewImage}
                imageUrl={previewImage?.url}
                imageName={previewImage?.name}
                onClose={handleClosePreview}
            />
        </>
    )
}
