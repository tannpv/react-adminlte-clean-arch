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
        return (
            <div className="loading-state">
                <div className="loading-content">
                    <i className="fas fa-spinner fa-spin loading-icon"></i>
                    <h4 className="loading-title">Loading Files</h4>
                    <p className="loading-description">Please wait while we fetch your files and folders...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="error-state">
                <div className="error-content">
                    <i className="fas fa-exclamation-circle error-icon"></i>
                    <h4 className="error-title">Failed to Load Files</h4>
                    <p className="error-description">
                        {error?.message || 'An unexpected error occurred while loading your files.'}
                    </p>
                </div>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-content">
                    <i className="fas fa-folder-open empty-state-icon"></i>
                    <h4 className="empty-state-title">Empty Directory</h4>
                    <p className="empty-state-description">
                        This directory is empty. Upload files or create folders to get started.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="storage-list-container">
                <div className="table-responsive">
                    <table className="table table-hover storage-table align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th className="file-icon-column">
                                    <i className="fas fa-image mr-2"></i>
                                    Preview
                                </th>
                                <th className="file-name-column">
                                    <i className="fas fa-file mr-2"></i>
                                    Name
                                </th>
                                <th className="file-type-column">
                                    <i className="fas fa-tag mr-2"></i>
                                    Type
                                </th>
                                <th className="file-size-column">
                                    <i className="fas fa-weight-hanging mr-2"></i>
                                    Size
                                </th>
                                <th className="file-visibility-column">
                                    <i className="fas fa-eye mr-2"></i>
                                    Visibility
                                </th>
                                <th className="file-actions-column text-center">
                                    <i className="fas fa-cogs mr-2"></i>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => {
                                const isImage = item.type === 'file' && isImageFile(item.mimeType, item.originalName)
                                const fileIcon = item.type === 'file' ? getFileIcon(item.mimeType, item.originalName) : 'fas fa-folder'
                                const fileSize = item.type === 'file' ? formatFileSize(item.sizeBytes) : '-'
                                const fileType = getFileDisplayType(item.type, item.originalName)
                                const fullImageUrl = isImage && item.url ? getFullFileUrl(item.url) : null
                                const isDirectory = item.type === 'directory'

                                return (
                                    <tr key={`${item.type}-${item.id}`} className="storage-row">
                                        <td className="file-icon-cell">
                                            {isImage && fullImageUrl ? (
                                                <div className="file-preview">
                                                    <img
                                                        src={fullImageUrl}
                                                        alt={item.displayName || item.originalName}
                                                        className="preview-thumbnail"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none'
                                                            e.target.nextSibling.style.display = 'flex'
                                                        }}
                                                        onClick={() => handleImageClick(item)}
                                                        title={`Click to view full size: ${item.displayName || item.originalName}`}
                                                    />
                                                    <div className="preview-fallback" style={{ display: 'none' }}>
                                                        <i className={fileIcon}></i>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="file-icon">
                                                    <i
                                                        className={fileIcon}
                                                        style={{
                                                            color: isDirectory ? '#ffc107' : '#6c757d',
                                                            fontSize: '1.5rem'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </td>
                                        <td className="file-name-cell">
                                            {isDirectory ? (
                                                <div className="directory-item">
                                                    <a
                                                        href="#"
                                                        className="directory-link"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            onEnterDirectory(item.id)
                                                        }}
                                                    >
                                                        <i className="fas fa-folder mr-2"></i>
                                                        {item.name}
                                                    </a>
                                                </div>
                                            ) : (canUpdate && onUpdateDisplayName && editingId === item.id) ? (
                                                <div className="edit-container">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm edit-input"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onKeyDown={(e) => handleKeyPress(e, item)}
                                                        onBlur={() => handleSaveEdit(item)}
                                                        autoFocus
                                                    />
                                                    <div className="edit-actions">
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleSaveEdit(item)}
                                                            title="Save"
                                                        >
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={handleCancelEdit}
                                                            title="Cancel"
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="file-item">
                                                    <span
                                                        className="file-name"
                                                        style={{ cursor: canUpdate && onUpdateDisplayName ? 'pointer' : 'default' }}
                                                        onClick={() => handleStartEdit(item)}
                                                        title={canUpdate && onUpdateDisplayName ? 'Click to edit display name' : undefined}
                                                    >
                                                        {item.displayName || item.originalName}
                                                    </span>
                                                    {canUpdate && onUpdateDisplayName && (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary edit-btn"
                                                            onClick={() => handleStartEdit(item)}
                                                            title="Edit display name"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="file-type-cell">
                                            <span className="file-type-badge">
                                                {fileType}
                                            </span>
                                        </td>
                                        <td className="file-size-cell">
                                            <span className="file-size">
                                                {fileSize}
                                            </span>
                                        </td>
                                        <td className="file-visibility-cell">
                                            <span className={`visibility-badge ${item.visibility === 'public' ? 'visibility-public' : 'visibility-private'}`}>
                                                <i className={`fas ${item.visibility === 'public' ? 'fa-globe' : 'fa-lock'} mr-1`}></i>
                                                {item.visibility || 'Private'}
                                            </span>
                                        </td>
                                        <td className="file-actions-cell text-center">
                                            <div className="action-buttons">
                                                {item.type === 'file' && canUpdate && onToggleVisibility && (
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary mr-2"
                                                        title={`Make ${item.visibility === 'public' ? 'private' : 'public'}`}
                                                        onClick={() => onToggleVisibility(item)}
                                                    >
                                                        <i className={`fas ${item.visibility === 'public' ? 'fa-lock' : 'fa-lock-open'}`}></i>
                                                    </button>
                                                )}
                                                {canDelete && onDelete && (
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => onDelete(item)}
                                                        title="Delete item"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <ImagePreviewModal
                show={!!previewImage}
                imageUrl={previewImage?.url}
                imageName={previewImage?.name}
                onClose={handleClosePreview}
            />
        </>
    )
}