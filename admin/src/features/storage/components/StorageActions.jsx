import React from 'react'

export function StorageActions({ onCreateDirectory, onUpload, onCreateDirectoryClick }) {
    const inputRef = React.useRef(null)

    const handleCreate = () => {
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
        <div className="d-flex flex-column flex-md-row align-items-stretch w-100" style={{ gap: '12px' }}>
            <div className="d-flex align-items-stretch w-100" style={{ maxWidth: 360 }}>
                <input
                    ref={inputRef}
                    className="form-control mr-2"
                    style={{ flex: 1 }}
                    placeholder="New folder name"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            handleCreate()
                        }
                    }}
                />
                <button
                    className="btn btn-primary h-100"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={handleCreate}
                >
                    Create
                </button>
            </div>
            <div className="ml-md-3 mt-2 mt-md-0 d-flex align-items-stretch">
                <label className="btn btn-success d-flex align-items-center justify-content-center h-100 mb-0" style={{ whiteSpace: 'nowrap' }}>
                    <i className="fas fa-upload mr-1" /> Upload
                    <input type="file" className="d-none" onChange={onUpload} />
                </label>
            </div>
        </div>
    )
}
