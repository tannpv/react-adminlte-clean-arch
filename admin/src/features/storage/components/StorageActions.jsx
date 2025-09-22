import React from 'react'

export function StorageActions({ onCreateDirectory, onUpload, canCreate = true, canUpload = true }) {
    const inputRef = React.useRef(null)

    const handleCreate = () => {
        if (!canCreate) {
            return
        }
        if (!inputRef.current) {
            return
        }

        const name = inputRef.current.value.trim()
        if (!name) {
            return
        }

        onCreateDirectory(name)
        inputRef.current.value = ''
    }

    return (
        <div className="storage-actions-container">
            <div className="action-group">
                <div className="input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text">
                            <i className="fas fa-folder-plus"></i>
                        </span>
                    </div>
                    <input
                        ref={inputRef}
                        className="form-control"
                        placeholder="Enter folder name..."
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleCreate()
                            }
                        }}
                        disabled={!canCreate}
                    />
                </div>
            </div>

            <div className="action-group">
                <button
                    className="btn btn-primary create-folder-btn"
                    onClick={handleCreate}
                    disabled={!canCreate}
                    title="Create new folder"
                >
                    <i className="fas fa-plus mr-2"></i>
                    Create Folder
                </button>
            </div>

            <div className="action-group">
                <label
                    className={`upload-btn ${!canUpload ? 'disabled' : ''}`}
                    title={canUpload ? 'Upload files to current directory' : 'Upload not allowed'}
                >
                    <i className="fas fa-upload mr-2"></i>
                    Upload Files
                    <input
                        type="file"
                        className="d-none"
                        onChange={onUpload}
                        disabled={!canUpload}
                        multiple
                    />
                </label>
            </div>
        </div>
    )
}