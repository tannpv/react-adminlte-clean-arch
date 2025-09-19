import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useCallback, useMemo, useState } from 'react'
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'
import { ConfirmModal } from '../../../shared/components/ConfirmModal'
import { createDirectory, deleteDirectory, deleteFile, listStorage, updateFile, uploadFile } from '../api/storageApi'
import { DirectoryModal } from '../components/DirectoryModal'
import { StorageActions } from '../components/StorageActions'
import { StorageBreadcrumb } from '../components/StorageBreadcrumb'
import { StorageList } from '../components/StorageList'

export default function StoragePage() {
    const [currentDirectoryId, setCurrentDirectoryId] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [targetItem, setTargetItem] = useState(null)
    const [formErrors, setFormErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const qc = useQueryClient()

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['storage', { directoryId: currentDirectoryId }],
        queryFn: () => listStorage({ directoryId: currentDirectoryId }),
    })

    // Backend returns { directories, files } - combine them into items
    const directories = data?.directories || []
    const files = data?.files || []
    const items = useMemo(() => [
        ...directories.map(dir => ({ ...dir, type: 'directory' })),
        ...files.map(file => ({ ...file, type: 'file' }))
    ], [directories, files])
    const breadcrumb = useMemo(() => data?.breadcrumb || [], [data])

    // Configure toastr
    React.useEffect(() => {
        toastr.options = {
            positionClass: 'toast-top-right',
            timeOut: 3000,
            closeButton: true,
            progressBar: true,
            newestOnTop: true,
        }
    }, [])

    // Mutations
    const createDirMutation = useMutation({
        mutationFn: (payload) => createDirectory({ ...payload, parentId: currentDirectoryId }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['storage'] })
            toastr.success('Directory created successfully')
        },
        onError: (e) => {
            const status = e?.response?.status
            if (status !== 400) toastr.error(e?.message || 'Failed to create directory')
        },
    })

    const uploadMutation = useMutation({
        mutationFn: ({ file }) => uploadFile({ file, directoryId: currentDirectoryId }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['storage'] })
            toastr.success('File uploaded successfully')
        },
        onError: (e) => toastr.error(e?.message || 'Failed to upload file'),
    })

    const deleteMutation = useMutation({
        mutationFn: ({ type, id }) => type === 'directory' ? deleteDirectory(id) : deleteFile(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['storage'] })
            toastr.success('Item deleted successfully')
        },
        onError: (e) => toastr.error(e?.message || 'Failed to delete item'),
    })

    const updateFileMutation = useMutation({
        mutationFn: ({ id, visibility }) => updateFile(id, { visibility }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['storage'] })
            toastr.success('File visibility updated')
        },
        onError: (e) => toastr.error(e?.message || 'Failed to update file'),
    })

    const handleCreateDir = useCallback(async (name) => {
        setSubmitting(true)
        setFormErrors({})
        try {
            await createDirMutation.mutateAsync({ name })
            setModalOpen(false)
        } catch (e) {
            const status = e?.response?.status
            const vErrors = e?.response?.data?.errors || e?.response?.data?.error?.details?.fieldErrors
            if (status === 400 && vErrors && typeof vErrors === 'object') {
                const norm = Object.fromEntries(
                    Object.entries(vErrors).map(([k, v]) => [k, typeof v === 'string' ? v : v?.message || 'Invalid'])
                )
                setFormErrors(norm)
            }
        } finally {
            setSubmitting(false)
        }
    }, [createDirMutation])

    const handleUpload = useCallback(async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        await uploadMutation.mutateAsync({ file })
        e.target.value = ''
    }, [uploadMutation])

    const handleEnterDir = useCallback((dirId) => setCurrentDirectoryId(dirId), [])

    const handleDelete = useCallback((item) => {
        setTargetItem(item)
        setConfirmOpen(true)
    }, [])

    const handleToggleVisibility = useCallback(async (file) => {
        const next = file.visibility === 'public' ? 'private' : 'public'
        await updateFileMutation.mutateAsync({ id: file.id, visibility: next })
    }, [updateFileMutation])

    const handleNavigate = useCallback((id) => setCurrentDirectoryId(id), [])

    return (
        <>
            <div className="d-flex align-items-center mb-3">
                <h4 className="mb-0 mr-3">Storage</h4>
                <StorageBreadcrumb
                    currentDirectoryId={currentDirectoryId}
                    breadcrumb={breadcrumb}
                    onNavigate={handleNavigate}
                />
            </div>

            <div className="card">
                <div className="card-header">
                    <StorageActions
                        onCreateDirectory={handleCreateDir}
                        onUpload={handleUpload}
                        onCreateDirectoryClick={() => setModalOpen(true)}
                    />
                </div>

                <div className="card-body p-0">
                    <StorageList
                        items={items}
                        loading={isLoading}
                        error={isError ? error : null}
                        onEnterDirectory={handleEnterDir}
                        onDelete={handleDelete}
                        onToggleVisibility={handleToggleVisibility}
                    />
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
                        await deleteMutation.mutateAsync({ type: targetItem.type, id: targetItem.id })
                    }
                    setConfirmOpen(false)
                    setTargetItem(null)
                }}
            />
        </>
    )
}