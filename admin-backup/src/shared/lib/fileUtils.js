/**
 * Helper functions for file operations and display
 */

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "1.2 MB", "500 KB")
 */
export function formatFileSize(bytes) {
    if (!bytes) return '-'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get file extension from filename
 * @param {string} filename - The filename
 * @returns {string} File extension in lowercase
 */
export function getFileExtension(filename) {
    if (!filename) return ''
    const parts = filename.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * Check if file is an image based on MIME type or extension
 * @param {string} mimeType - MIME type of the file
 * @param {string} filename - The filename
 * @returns {boolean} True if file is an image
 */
export function isImageFile(mimeType, filename) {
    if (mimeType) {
        return mimeType.startsWith('image/')
    }
    const ext = getFileExtension(filename)
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)
}

/**
 * Get appropriate FontAwesome icon class for file type
 * @param {string} mimeType - MIME type of the file
 * @param {string} filename - The filename
 * @returns {string} FontAwesome icon class
 */
export function getFileIcon(mimeType, filename) {
    if (!mimeType && !filename) return 'fas fa-file'

    const ext = getFileExtension(filename)

    // Image files
    if (isImageFile(mimeType, filename)) {
        return 'fas fa-image'
    }

    // Document files
    if (['pdf'].includes(ext) || mimeType?.includes('pdf')) {
        return 'fas fa-file-pdf'
    }
    if (['doc', 'docx'].includes(ext) || mimeType?.includes('document')) {
        return 'fas fa-file-word'
    }
    if (['xls', 'xlsx'].includes(ext) || mimeType?.includes('spreadsheet')) {
        return 'fas fa-file-excel'
    }
    if (['ppt', 'pptx'].includes(ext) || mimeType?.includes('presentation')) {
        return 'fas fa-file-powerpoint'
    }

    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
        return 'fas fa-file-archive'
    }

    // Video files
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext) || mimeType?.startsWith('video/')) {
        return 'fas fa-file-video'
    }

    // Audio files
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext) || mimeType?.startsWith('audio/')) {
        return 'fas fa-file-audio'
    }

    // Text files
    if (['txt', 'md', 'json', 'xml', 'csv'].includes(ext) || mimeType?.includes('text/')) {
        return 'fas fa-file-alt'
    }

    // Code files
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'php', 'py', 'java', 'cpp', 'c'].includes(ext)) {
        return 'fas fa-file-code'
    }

    return 'fas fa-file'
}

/**
 * Get display type for file (extension or 'folder')
 * @param {string} type - Item type ('file' or 'directory')
 * @param {string} filename - The filename (for files)
 * @returns {string} Display type
 */
export function getFileDisplayType(type, filename) {
    if (type === 'directory') return 'folder'
    return getFileExtension(filename) || 'file'
}

/**
 * Get file type category for grouping
 * @param {string} mimeType - MIME type of the file
 * @param {string} filename - The filename
 * @returns {string} File category
 */
export function getFileCategory(mimeType, filename) {
    const ext = getFileExtension(filename)

    if (isImageFile(mimeType, filename)) return 'image'
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'document'
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive'
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext) || mimeType?.startsWith('video/')) return 'video'
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext) || mimeType?.startsWith('audio/')) return 'audio'
    if (['txt', 'md', 'json', 'xml', 'csv'].includes(ext) || mimeType?.includes('text/')) return 'text'
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'php', 'py', 'java', 'cpp', 'c'].includes(ext)) return 'code'

    return 'other'
}

/**
 * Get full URL for file access
 * @param {string} url - Relative URL from backend (e.g., "/uploads/filename.jpg")
 * @returns {string} Full URL for frontend access
 */
export function getFullFileUrl(url) {
    if (!url) return ''

    // If URL is already absolute, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }

    // Get the backend base URL (same as API client)
    const backendBase = import.meta?.env?.VITE_API_BASE_URL || '/api'

    // For development, if VITE_API_BASE_URL is not set, assume backend runs on localhost:3001
    let baseUrl
    if (backendBase === '/api') {
        // Development mode - backend typically runs on port 3001
        baseUrl = 'http://localhost:3001'
    } else {
        // Production or custom URL - remove '/api' suffix if present
        baseUrl = backendBase.replace(/\/api$/, '')
    }

    // Ensure URL starts with /
    const filePath = url.startsWith('/') ? url : `/${url}`

    const fullUrl = `${baseUrl}${filePath}`

    // Debug logging in development
    if (import.meta?.env?.DEV) {
        console.log('[getFullFileUrl]', { url, backendBase, baseUrl, filePath, fullUrl })
    }

    return fullUrl
}

/**
 * Validate file upload
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes
 * @param {Array} options.allowedTypes - Allowed MIME types
 * @param {Array} options.allowedExtensions - Allowed file extensions
 * @returns {Object} Validation result with isValid and error message
 */
export function validateFile(file, options = {}) {
    const { maxSize = 20 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options

    if (!file) {
        return { isValid: false, error: 'No file selected' }
    }

    if (file.size > maxSize) {
        return { isValid: false, error: `File size must be less than ${formatFileSize(maxSize)}` }
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return { isValid: false, error: `File type ${file.type} is not allowed` }
    }

    if (allowedExtensions.length > 0) {
        const ext = getFileExtension(file.name)
        if (!allowedExtensions.includes(ext)) {
            return { isValid: false, error: `File extension .${ext} is not allowed` }
        }
    }

    return { isValid: true, error: null }
}
