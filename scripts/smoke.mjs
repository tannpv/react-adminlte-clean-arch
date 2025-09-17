import { spawn } from 'node:child_process'
import process from 'node:process'

const waitFor = (ms) => new Promise(r => setTimeout(r, ms))

async function startServer() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['server/index.js'], { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PORT: '3001' } })
    let ready = false
    const onData = (buf) => {
      const s = buf.toString()
      if (s.includes('API server listening')) {
        ready = true
        resolve(child)
      }
    }
    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    child.on('exit', (code) => {
      if (!ready) reject(new Error(`Server exited early with code ${code}`))
    })
  })
}

async function run() {
  const child = await startServer()
  try {
    // Health
    const health = await fetch('http://localhost:3001/api/health')
    if (!health.ok) throw new Error('Health check failed')

    // Login default user
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'tannpv2@gmail.com', password: '1234567890' })
    })
    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`)
    const { token } = await loginRes.json()
    const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

    // List users
    let listRes = await fetch('http://localhost:3001/api/users', { headers: { Authorization: `Bearer ${token}` } })
    if (!listRes.ok) throw new Error('List users failed')
    let users = await listRes.json()

    // Create user
    const createdRes = await fetch('http://localhost:3001/api/users', { method: 'POST', headers: authHeaders, body: JSON.stringify({ name: 'Test User', email: 'test@example.com' }) })
    if (!createdRes.ok) throw new Error('Create failed')
    const created = await createdRes.json()

    // Update user
    const updatedRes = await fetch(`http://localhost:3001/api/users/${created.id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify({ name: 'Updated User' }) })
    if (!updatedRes.ok) throw new Error('Update failed')
    await updatedRes.json()

    // Delete user
    const delRes = await fetch(`http://localhost:3001/api/users/${created.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (!delRes.ok) throw new Error('Delete failed')
    await delRes.json()

    // Final list
    listRes = await fetch('http://localhost:3001/api/users', { headers: { Authorization: `Bearer ${token}` } })
    users = await listRes.json()

    console.log('Smoke test passed. Users count:', users.length)
  } finally {
    // Give the server a moment to flush logs, then kill it
    await waitFor(100)
    child.kill('SIGTERM')
  }
}

run().catch((e) => {
  console.error('Smoke test failed:', e)
  process.exit(1)
})
