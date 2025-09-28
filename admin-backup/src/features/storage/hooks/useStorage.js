import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'
import { createDirectory, deleteDirectory, deleteFile, listStorage, updateFile, uploadFile } from '../api/storageApi'

export function useStorage(currentDirectoryId, { enabled = true } = {}) {
    const qc = useQueryClient()

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

    // Query for listing storage items
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['storage', { directoryId: currentDirectoryId }],
        queryFn: () => listStorage({ directoryId: currentDirectoryId }),
        enabled,
    })

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
        mutationFn: ({ id, visibility, displayName }) => updateFile(id, { visibility, displayName }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['storage'] })
            toastr.success('File updated successfully')
        },
        onError: (e) => toastr.error(e?.message || 'Failed to update file'),
    })

    // Helper functions
    const handleCreateDir = async (name) => {
        try {
            await createDirMutation.mutateAsync({ name })
        } catch (e) {
            const status = e?.response?.status
            const vErrors = e?.response?.data?.errors || e?.response?.data?.error?.details?.fieldErrors
            if (status === 400 && vErrors && typeof vErrors === 'object') {
                const norm = Object.fromEntries(
                    Object.entries(vErrors).map(([k, v]) => [k, typeof v === 'string' ? v : v?.message || 'Invalid'])
                )
                throw norm // Re-throw for form handling
            }
            throw e
        }
    }

    const handleUpload = async (file) => {
        await uploadMutation.mutateAsync({ file })
    }

    const handleDelete = async (type, id) => {
        await deleteMutation.mutateAsync({ type, id })
    }

    const handleToggleVisibility = async (file) => {
        const next = file.visibility === 'public' ? 'private' : 'public'
        await updateFileMutation.mutateAsync({ id: file.id, visibility: next })
    }

    const handleUpdateDisplayName = async (fileId, displayName) => {
        await updateFileMutation.mutateAsync({ id: fileId, displayName })
    }

    return {
        // Data
        data,
        isLoading,
        isError,
        error,

        // Mutations
        createDirMutation,
        uploadMutation,
        deleteMutation,
        updateFileMutation,

        // Handlers
        handleCreateDir,
        handleUpload,
        handleDelete,
        handleToggleVisibility,
        handleUpdateDisplayName,
    }
}
