import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const PORT = process.env.PORT || 3001

const dbPath = path.join(__dirname, 'db.json')

function ensureDb() {
  if (!fs.existsSync(dbPath)) {
    const seed = { users: [
      { id: 1, name: 'Leanne Graham', email: 'Sincere@april.biz' },
      { id: 2, name: 'Ervin Howell', email: 'Shanna@melissa.tv' },
    ] }
    fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2))
  }
}

function readDb() {
  ensureDb()
  const raw = fs.readFileSync(dbPath, 'utf-8')
  return JSON.parse(raw)
}

function writeDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

app.use(express.json())

// Simple health check
app.get('/api/health', (_req, res) => res.json({ ok: true }))

// List users
app.get('/api/users', (_req, res) => {
  const db = readDb()
  res.json(db.users)
})

// Get user by id
app.get('/api/users/:id', (req, res) => {
  const id = Number(req.params.id)
  const db = readDb()
  const user = db.users.find(u => u.id === id)
  if (!user) return res.status(404).json({ message: 'Not found' })
  res.json(user)
})

// Create user
app.post('/api/users', (req, res) => {
  const { name, email } = req.body || {}
  if (!name || !email) return res.status(400).json({ message: 'name and email required' })
  const db = readDb()
  const nextId = (db.users.reduce((m, u) => Math.max(m, u.id), 0) || 0) + 1
  const user = { id: nextId, name, email }
  db.users.push(user)
  writeDb(db)
  res.status(201).json(user)
})

// Update user
app.put('/api/users/:id', (req, res) => {
  const id = Number(req.params.id)
  const { name, email } = req.body || {}
  const db = readDb()
  const idx = db.users.findIndex(u => u.id === id)
  if (idx === -1) return res.status(404).json({ message: 'Not found' })
  const existing = db.users[idx]
  const updated = { ...existing, ...(name !== undefined ? { name } : {}), ...(email !== undefined ? { email } : {}) }
  db.users[idx] = updated
  writeDb(db)
  res.json(updated)
})

// Delete user
app.delete('/api/users/:id', (req, res) => {
  const id = Number(req.params.id)
  const db = readDb()
  const idx = db.users.findIndex(u => u.id === id)
  if (idx === -1) return res.status(404).json({ message: 'Not found' })
  const [removed] = db.users.splice(idx, 1)
  writeDb(db)
  res.json(removed)
})

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`)
})

