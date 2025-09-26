import React, { useCallback, useMemo, useState } from 'react'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { usePermissions } from '../../../shared/hooks/usePermissions'
import { DirectoryModal } from '../components/DirectoryModal'
import { StorageActions } from '../components/StorageActions'
import { StorageBreadcrumb } from '../components/StorageBreadcrumb'
import { StorageList } from '../components/StorageList'
import { useStorage } from '../hooks/useStorage'
import {
    deriveStoragePermissions,
    mergeStorageItems,
    normalizeDirectoryPayload,
} from '../utils/storageHelpers'

export default function StoragePage() {
    const [currentDirectoryId, setCurrentDirectoryId] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [targetItem, setTargetItem] = useState(null)
    const [formErrors, setFormErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const { me, permissions } = usePermissions()
    const { canRead, canCreate, canUpdate, canDelete, canViewStorage } = useMemo(
        () => deriveStoragePermissions(permissions),
        [permissions]
    )
    const permissionsLoaded = !!me

    // Use the custom hook for storage operations
    const {
        data,
        isLoading,
        isError,
        error,
        handleCreateDir: createDir,
        handleUpload: upload,
        handleDelete: deleteItem,
        handleToggleVisibility: toggleVisibility,
        handleUpdateDisplayName: updateDisplayName,
    } = useStorage(currentDirectoryId, { enabled: permissionsLoaded && canViewStorage })

    // Backend returns { directories, files } - combine them into items
    const directories = data?.directories || []
    const files = data?.files || []
    const items = useMemo(() => mergeStorageItems(directories, files), [directories, files])
    const breadcrumb = useMemo(() => data?.breadcrumb || [], [data])

    // Calculate statistics
    const totalItems = items.length
    const totalFiles = files.length
    const totalDirectories = directories.length
    const totalSize = files.reduce((sum, file) => sum + (file.sizeBytes || 0), 0)
    const publicFiles = files.filter(file => file.visibility === 'public').length

    const handleCreateDir = useCallback(async (input) => {
        if (!canCreate) return
        const name = normalizeDirectoryPayload(input)
        if (!name) return
        setSubmitting(true)
        setFormErrors({})
        try {
            await createDir(name)
            setModalOpen(false)
        } catch (e) {
            if (typeof e === 'object' && e !== null) {
                setFormErrors(e)
            }
        } finally {
            setSubmitting(false)
        }
    }, [canCreate, createDir])

    const handleUpload = useCallback(async (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        if (!canCreate) {
            event.target.value = ''
            return
        }
        await upload(file)
        event.target.value = ''
    }, [upload, canCreate])

    const handleEnterDir = useCallback((dirId) => setCurrentDirectoryId(dirId), [])

    const handleNavigate = useCallback((dirId) => setCurrentDirectoryId(dirId), [])

    const handleDelete = useCallback((item) => {
        if (!canDelete) return
        setTargetItem(item)
        setConfirmOpen(true)
    }, [canDelete])

    const handleToggleVisibility = useCallback(async (file) => {
        if (!canUpdate) return
        await toggleVisibility(file)
    }, [toggleVisibility, canUpdate])

    const handleUpdateDisplayName = useCallback(async (fileId, displayName) => {
        if (!canUpdate) return
        await updateDisplayName(fileId, displayName)
    }, [updateDisplayName, canUpdate])

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <>
            <div className="page-card">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">
                            <i className="fas fa-hdd mr-2"></i>
                            File Storage
                        </h2>
                        <p className="page-subtitle">
                            Manage your files and folders. Upload, organize, and share your content securely.
                        </p>
                        <div className="storage-breadcrumb">
                            <StorageBreadcrumb
                                currentDirectoryId={currentDirectoryId}
                                breadcrumb={breadcrumb}
                                onNavigate={handleNavigate}
                            />
                        </div>
                    </div>
                    {canCreate && (
                        <div className="page-actions">
                            <StorageActions
                                onCreateDirectory={() => setModalOpen(true)}
                                onUpload={handleUpload}
                                canCreate={canCreate}
                                canUpload={canCreate}
                            />
                        </div>
                    )}
                </div>

                <div className="page-body">
                    {!permissionsLoaded && (
                        <div className="loading-state">
                            <div className="loading-content">
                                <i className="fas fa-spinner fa-spin loading-icon"></i>
                                <h4 className="loading-title">Loading Permissions</h4>
                                <p className="loading-description">Please wait while we check your access permissions...</p>
                            </div>
                        </div>
                    )}

                    {permissionsLoaded && !canViewStorage && (
                        <div className="error-state">
                            <div className="error-content">
                                <i className="fas fa-ban error-icon"></i>
                                <h4 className="error-title">Access Denied</h4>
                                <p className="error-description">
                                    You do not have permission to access the file storage system.
                                </p>
                            </div>
                        </div>
                    )}

                    {permissionsLoaded && canViewStorage && (
                        <div className="storage-content">
                            {/* Statistics Dashboard */}
                            <div className="storage-stats mb-4">
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-folder"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">{totalDirectories}</div>
                                                <div className="stat-label">Directories</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-file"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">{totalFiles}</div>
                                                <div className="stat-label">Files</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-globe"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">{publicFiles}</div>
                                                <div className="stat-label">Public Files</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-weight-hanging"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">{formatFileSize(totalSize)}</div>
                                                <div className="stat-label">Total Size</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Storage List Section */}
                            <div className="storage-table-section">
                                <div className="section-header">
                                    <h5 className="section-title">
                                        <i className="fas fa-list mr-2"></i>
                                        Files & Folders
                                    </h5>
                                    <p className="section-description">
                                        {currentDirectoryId
                                            ? `Contents of current directory (${totalItems} items)`
                                            : `Root directory contents (${totalItems} items)`
                                        }
                                    </p>
                                </div>

                                <StorageList
                                    items={items}
                                    loading={isLoading}
                                    error={isError ? error : null}
                                    onEnterDirectory={handleEnterDir}
                                    onDelete={canDelete ? handleDelete : undefined}
                                    onToggleVisibility={canUpdate ? handleToggleVisibility : undefined}
                                    onUpdateDisplayName={canUpdate ? handleUpdateDisplayName : undefined}
                                    canUpdate={canUpdate}
                                    canDelete={canDelete}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {canCreate && (
                <DirectoryModal
                    show={modalOpen}
                    title="Create Directory"
                    onClose={() => { setModalOpen(false); setFormErrors({}) }}
                    onSubmit={handleCreateDir}
                    errors={formErrors}
                    submitting={submitting}
                />
            )}

            {canDelete && (
                <ConfirmModal
                    show={confirmOpen}
                    title="Delete Item"
                    message={`Are you sure you want to delete ${targetItem?.type} "${targetItem?.name || targetItem?.displayName}"?`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    onCancel={() => { setConfirmOpen(false); setTargetItem(null) }}
                    onConfirm={async () => {
                        if (targetItem) {
                            await deleteItem(targetItem.type, targetItem.id)
                        }
                        setConfirmOpen(false)
                        setTargetItem(null)
                    }}
                />
            )}
        </>
    )
}