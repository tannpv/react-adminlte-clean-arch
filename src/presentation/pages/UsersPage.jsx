import React, { useEffect, useState } from 'react'
import { UserList } from '../components/UserList'
import { UserForm } from '../components/UserForm'

export function UsersPage({ getUsersUseCase, createUserUseCase, updateUserUseCase, deleteUserUseCase }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await getUsersUseCase.execute()
        if (mounted) setUsers(res)
      } catch (err) {
        console.error(err)
        if (mounted) setError(err?.message || 'Failed to load users')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => (mounted = false)
  }, [getUsersUseCase])

  return (
    <>
      <h3>Users</h3>
      <UserForm
        initialUser={editing}
        onCancel={() => setEditing(null)}
        onSubmit={async (payload) => {
          try {
            setError(null)
            if (editing?.id) {
              const updated = await updateUserUseCase.execute(editing.id, payload)
              setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
              setEditing(null)
            } else {
              const created = await createUserUseCase.execute(payload)
              setUsers(prev => [...prev, created])
            }
          } catch (e) {
            setError(e?.message || 'Failed to save user')
          }
        }}
      />

      {loading && <div>Loading...</div>}
      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && (
        <UserList
          users={users}
          onEdit={(u) => setEditing(u)}
          onDelete={async (id) => {
            try {
              setError(null)
              await deleteUserUseCase.execute(id)
              setUsers(prev => prev.filter(u => u.id !== id))
              if (editing?.id === id) setEditing(null)
            } catch (e) {
              setError(e?.message || 'Failed to delete user')
            }
          }}
        />
      )}
    </>
  )
}
