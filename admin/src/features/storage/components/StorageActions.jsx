import React from 'react'

export function StorageActions({ onCreateDirectory, onUpload, onCreateDirectoryClick }) {
    return (
        <div className="d-flex align-items-center">
            <div className="input-group" style={{ maxWidth: 360 }}>
                <input
                    className="form-control"
                    placeholder="New folder name"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            const name = e.target.value.trim()
                            if (name) {
                                onCreateDirectory(name)
                                e.target.value = ''
                            }
                        }
                    }}
                />
                <div className="input-group-append">
                    <button
                        className="btn btn-primary"
                        onClick={(e) => {
                            const input = e.target.closest('.input-group').querySelector('input')
                            const name = input.value.trim()
                            if (name) {
                                onCreateDirectory(name)
                                input.value = ''
                            }
                        }}
                    >
                        Create
                    </button>
                </div>
            </div>
            <div className="ml-auto">
                <label className="btn btn-success mb-0">
                    <i className="fas fa-upload mr-1" /> Upload
                    <input type="file" className="d-none" onChange={onUpload} />
                </label>
            </div>
        </div>
    )
}

