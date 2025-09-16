import React, { useEffect, useState } from 'react'

export function UserForm({ onSubmit, initialUser, onCancel }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    setName(initialUser?.name || '')
    setEmail(initialUser?.email || '')
  }, [initialUser])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ name: name.trim(), email: email.trim() })
  }

  const isEditing = !!initialUser?.id

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="form-row">
        <div className="form-group col-md-5">
          <label>Name</label>
          <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group col-md-5">
          <label>Email</label>
          <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group col-md-2 d-flex align-items-end">
          <button type="submit" className="btn btn-primary mr-2">{isEditing ? 'Update' : 'Add'}</button>
          {isEditing && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          )}
        </div>
      </div>
    </form>
  )
}

