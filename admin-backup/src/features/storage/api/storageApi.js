import { ApiClient } from '../../../shared/lib/apiClient'

// Directory and file listing
export async function listStorage(params = {}) {
    const { directoryId } = params
    const query = directoryId === null || directoryId === undefined || directoryId === '' ? '' : `?directoryId=${directoryId}`
    const { data } = await ApiClient.get(`/storage${query}`)
    return data
}

// Directories
export async function createDirectory(input) {
    const { data } = await ApiClient.post('/storage/directories', input)
    return data
}

export async function updateDirectory(id, input) {
    const { data } = await ApiClient.patch(`/storage/directories/${id}`, input)
    return data
}

export async function deleteDirectory(id) {
    const { data } = await ApiClient.delete(`/storage/directories/${id}`)
    return data
}

export async function setDirectoryGrants(id, grants) {
    const { data } = await ApiClient.put(`/storage/directories/${id}/grants`, grants)
    return data
}

// Files
export async function uploadFile({ file, directoryId = null, displayName, visibility = 'private' }) {
    const form = new FormData()
    form.append('file', file)
    if (directoryId !== null && directoryId !== undefined && directoryId !== '') form.append('directoryId', String(directoryId))
    if (displayName) form.append('displayName', displayName)
    if (visibility) form.append('visibility', visibility)
    const { data } = await ApiClient.post('/storage/files', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return data
}

export async function updateFile(id, input) {
    const { data } = await ApiClient.patch(`/storage/files/${id}`, input)
    return data
}

export async function deleteFile(id) {
    const { data } = await ApiClient.delete(`/storage/files/${id}`)
    return data
}

export async function setFileGrants(id, grants) {
    const { data } = await ApiClient.put(`/storage/files/${id}/grants`, grants)
    return data
}



