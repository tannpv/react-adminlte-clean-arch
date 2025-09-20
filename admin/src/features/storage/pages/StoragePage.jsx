import React, { useCallback, useMemo, useState } from 'react'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { DirectoryModal } from '../components/DirectoryModal'
import { StorageActions } from '../components/StorageActions'
import { StorageBreadcrumb } from '../components/StorageBreadcrumb'
import { StorageList } from '../components/StorageList'
import { useStorage } from '../hooks/useStorage'
import { usePermissions } from '../../../shared/hooks/usePermissions'
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

    return (
        <>
            <div className="page-card">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Storage</h2>
                        <div className="page-subtitle storage-breadcrumb">
                            <StorageBreadcrumb
                                currentDirectoryId={currentDirectoryId}
                                breadcrumb={breadcrumb}
                                onNavigate={handleNavigate}
                            />
                        </div>
                    </div>
                    {canCreate && (
                        <div className="page-actions storage-actions">
                            <StorageActions
                                onCreateDirectory={handleCreateDir}
                                onUpload={handleUpload}
                                canCreate={canCreate}
                                canUpload={canCreate}
                            />
                        </div>
                    )}
                </div>

                <div className="page-body">
                    <div className="storage-surface">
                        {!permissionsLoaded ? (
                            <div className="p-4 text-muted">Loading permissions…</div>
                        ) : !canViewStorage ? (
                            <div className="alert alert-warning mb-0" role="alert">
                                You do not have permission to access storage.
                            </div>
                        ) : (
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
                        )}
                    </div>
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
