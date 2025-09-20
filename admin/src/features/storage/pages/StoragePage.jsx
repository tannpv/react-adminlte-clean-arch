import React, { useCallback, useMemo, useState } from 'react'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { DirectoryModal } from '../components/DirectoryModal'
import { StorageActions } from '../components/StorageActions'
import { StorageBreadcrumb } from '../components/StorageBreadcrumb'
import { StorageList } from '../components/StorageList'
import { useStorage } from '../hooks/useStorage'

export default function StoragePage() {
    const [currentDirectoryId, setCurrentDirectoryId] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [targetItem, setTargetItem] = useState(null)
    const [formErrors, setFormErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    // Use the custom hook for storage operations
    const {
        data,
        isLoading,
        isError,
        error,
        handleCreateDir: createDir,
        handleUpload: upload,
        handleDelete: deleteItem,
        handleToggleVisibility,
        handleUpdateDisplayName,} = useStorage(currentDirectoryId)

    // Backend returns { directories, files } - combine them into items
    const directories = data?.directories || []
    const files = data?.files || []
    const items = useMemo(() => [
        ...directories.map(dir => ({ ...dir, type: 'directory' })),
        ...files.map(file => ({ ...file, type: 'file' }))
    ], [directories, files])
    const breadcrumb = useMemo(() => data?.breadcrumb || [], [data])

    // Enhanced handlers with form state management
    const handleCreateDir = useCallback(async (name) => {
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
    }, [createDir])

    const handleUpload = useCallback(async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        await upload(file)
        e.target.value = ''
    }, [upload])

    const handleEnterDir = useCallback((dirId) => setCurrentDirectoryId(dirId), [])

    const handleDelete = useCallback((item) => {
        setTargetItem(item)
        setConfirmOpen(true)
    }, [])

    const handleNavigate = useCallback((id) => setCurrentDirectoryId(id), [])

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
                    <div className="page-actions storage-actions">
                        <StorageActions
                            onCreateDirectory={handleCreateDir}
                            onUpload={handleUpload}
                            onCreateDirectoryClick={() => setModalOpen(true)}
                        />
                    </div>
                </div>

                <div className="page-body">
                    <div className="storage-surface">
                        <StorageList
                            items={items}
                            loading={isLoading}
                            error={isError ? error : null}
                            onEnterDirectory={handleEnterDir}
                            onDelete={handleDelete}
                            onToggleVisibility={handleToggleVisibility}
                            onUpdateDisplayName={handleUpdateDisplayName}
                        />
                    </div>
                </div>
            </div>

            <DirectoryModal
                show={modalOpen}
                title="Create Directory"
                onClose={() => { setModalOpen(false); setFormErrors({}) }}
                onSubmit={handleCreateDir}
                errors={formErrors}
                submitting={submitting}
            />

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
        </>
    )
}
