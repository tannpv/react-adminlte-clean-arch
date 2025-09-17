import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const DEFAULT_PORT = Number(process.env.PORT) || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

const dbPath = path.join(__dirname, 'db.json')

function ensureDb() {
  if (!fs.existsSync(dbPath)) {
    const passwordHash = bcrypt.hashSync('secret', 10)
    const seed = {
      users: [
        { id: 1, name: 'Leanne Graham', email: 'leanne@example.com', passwordHash },
        { id: 2, name: 'Ervin Howell', email: 'ervin@example.com', passwordHash },
      ],
      roles: [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'User' }
      ]
    }
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

// Migrate existing users to have passwordHash if missing (default password: secret)
app.use((req, _res, next) => {
  const db = readDb()
  let changed = false
  // Backfill password hashes
  db.users = db.users.map(u => {
    if (!u.passwordHash) {
      changed = true
      return { ...u, passwordHash: bcrypt.hashSync('secret', 10) }
    }
    return u
  })
  // Ensure roles collection exists
  if (!db.roles) {
    db.roles = [ { id: 1, name: 'Admin' }, { id: 2, name: 'User' } ]
    changed = true
  }
  if (changed) writeDb(db)
  next()
})

function toPublicUser(u) {
  const { passwordHash, ...pub } = u
  return pub
}

function validationError(res, fieldErrors) {
  // Standardized error envelope while keeping backward compatibility
  const simple = Object.fromEntries(
    Object.entries(fieldErrors).map(([k, v]) => [k, typeof v === 'string' ? v : v.message])
  )
  return res.status(400).json({
    message: 'Validation failed',
    errors: simple, // legacy/simple shape
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: {
        fieldErrors,
      },
    },
  })
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '1h' })
}

function authRequired(req, res, next) {
  const auth = req.headers.authorization || ''
  const [, token] = auth.split(' ')
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.sub
    return next()
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

// Simple health check
app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Auth: register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password required' })
  const db = readDb()
  if (db.users.some(u => u.email.toLowerCase() === String(email).toLowerCase())) {
    return res.status(409).json({ message: 'Email already in use' })
  }
  const nextId = (db.users.reduce((m, u) => Math.max(m, u.id), 0) || 0) + 1
  const passwordHash = bcrypt.hashSync(password, 10)
  const user = { id: nextId, name, email, passwordHash }
  db.users.push(user)
  writeDb(db)
  const token = signToken(user.id)
  res.status(201).json({ token, user: toPublicUser(user) })
})

// Auth: login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ message: 'email and password required' })
  const db = readDb()
  const user = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase())
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })
  const ok = bcrypt.compareSync(password, user.passwordHash)
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
  const token = signToken(user.id)
  res.json({ token, user: toPublicUser(user) })
})

// ===== Roles CRUD (protected) =====
app.get('/api/roles', authRequired, (_req, res) => {
  const db = readDb()
  res.json(db.roles)
})

app.post('/api/roles', authRequired, (req, res) => {
  const { name } = req.body || {}
  const db = readDb()
  const errors = {}
  if (!name || String(name).trim().length < 2) {
    errors.name = { code: 'NAME_MIN', message: 'Name is required (min 2 characters)' }
  } else if (db.roles.some(r => r.name.toLowerCase() === String(name).trim().toLowerCase())) {
    errors.name = { code: 'NAME_EXISTS', message: 'Role name already exists' }
  }
  if (Object.keys(errors).length) return validationError(res, errors)
  const nextId = (db.roles.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1
  const role = { id: nextId, name: String(name).trim() }
  db.roles.push(role)
  writeDb(db)
  res.status(201).json(role)
})

app.put('/api/roles/:id', authRequired, (req, res) => {
  const id = Number(req.params.id)
  const { name } = req.body || {}
  const db = readDb()
  const idx = db.roles.findIndex(r => r.id === id)
  if (idx === -1) return res.status(404).json({ message: 'Not found' })
  const errors = {}
  if (name !== undefined) {
    const nm = String(name).trim()
    if (!nm || nm.length < 2) {
      errors.name = { code: 'NAME_MIN', message: 'Name is required (min 2 characters)' }
    } else if (db.roles.some(r => r.id !== id && r.name.toLowerCase() === nm.toLowerCase())) {
      errors.name = { code: 'NAME_EXISTS', message: 'Role name already exists' }
    }
  }
  if (Object.keys(errors).length) return validationError(res, errors)
  const existing = db.roles[idx]
  const updated = { ...existing, ...(name !== undefined ? { name: String(name).trim() } : {}) }
  db.roles[idx] = updated
  writeDb(db)
  res.json(updated)
})

app.delete('/api/roles/:id', authRequired, (req, res) => {
  const id = Number(req.params.id)
  const db = readDb()
  const idx = db.roles.findIndex(r => r.id === id)
  if (idx === -1) return res.status(404).json({ message: 'Not found' })
  const [removed] = db.roles.splice(idx, 1)
  writeDb(db)
  res.json(removed)
})

// List users (protected)
app.get('/api/users', authRequired, (_req, res) => {
  const db = readDb()
  res.json(db.users.map(toPublicUser))
})

// Get user by id (protected)
app.get('/api/users/:id', authRequired, (req, res) => {
  const id = Number(req.params.id)
  const db = readDb()
  const user = db.users.find(u => u.id === id)
  if (!user) return res.status(404).json({ message: 'Not found' })
  res.json(toPublicUser(user))
})

// Create user (protected)
app.post('/api/users', authRequired, (req, res) => {
  const { name, email } = req.body || {}
  const db = readDb()

  const errors = {}
  if (!name || String(name).trim().length < 2) {
    errors.name = { code: 'NAME_MIN', message: 'Name is required (min 2 characters)' }
  }
  const emailStr = String(email || '')
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailStr) {
    errors.email = { code: 'EMAIL_REQUIRED', message: 'Email is required' }
  } else if (!emailRe.test(emailStr)) {
    errors.email = { code: 'EMAIL_INVALID', message: 'Email is invalid' }
  } else if (db.users.some(u => u.email.toLowerCase() === emailStr.toLowerCase())) {
    errors.email = { code: 'EMAIL_EXISTS', message: 'Email is already in use' }
  }
  if (Object.keys(errors).length) {
    return validationError(res, errors)
  }

  const nextId = (db.users.reduce((m, u) => Math.max(m, u.id), 0) || 0) + 1
  const user = { id: nextId, name: String(name).trim(), email: emailStr, passwordHash: bcrypt.hashSync('secret', 10) }
  db.users.push(user)
  writeDb(db)
  res.status(201).json(toPublicUser(user))
})

// Update user (protected)
app.put('/api/users/:id', authRequired, (req, res) => {
  const id = Number(req.params.id)
  const { name, email } = req.body || {}
  const db = readDb()
  const idx = db.users.findIndex(u => u.id === id)
  if (idx === -1) return res.status(404).json({ message: 'Not found' })

  const errors = {}
  if (name !== undefined) {
    if (!String(name).trim() || String(name).trim().length < 2) {
      errors.name = { code: 'NAME_MIN', message: 'Name is required (min 2 characters)' }
    }
  }
  if (email !== undefined) {
    const emailStr = String(email || '')
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailStr) {
      errors.email = { code: 'EMAIL_REQUIRED', message: 'Email is required' }
    } else if (!emailRe.test(emailStr)) {
      errors.email = { code: 'EMAIL_INVALID', message: 'Email is invalid' }
    } else if (db.users.some(u => u.id !== id && u.email.toLowerCase() === emailStr.toLowerCase())) {
      errors.email = { code: 'EMAIL_EXISTS', message: 'Email is already in use' }
    }
  }
  if (Object.keys(errors).length) {
    return validationError(res, errors)
  }

  const existing = db.users[idx]
  const updated = {
    ...existing,
    ...(name !== undefined ? { name: String(name).trim() } : {}),
    ...(email !== undefined ? { email: String(email).trim() } : {}),
  }
  db.users[idx] = updated
  writeDb(db)
  res.json(toPublicUser(updated))
})

// Delete user (protected)
app.delete('/api/users/:id', authRequired, (req, res) => {
  const id = Number(req.params.id)
  const db = readDb()
  const idx = db.users.findIndex(u => u.id === id)
  if (idx === -1) return res.status(404).json({ message: 'Not found' })
  const [removed] = db.users.splice(idx, 1)
  writeDb(db)
  res.json(toPublicUser(removed))
})

function startServer(port = DEFAULT_PORT, maxAttempts = 10) {
  const server = app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`)
  })
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && maxAttempts > 0) {
      const next = port + 1
      console.warn(`Port ${port} in use, retrying on ${next}...`)
      startServer(next, maxAttempts - 1)
    } else {
      console.error('Failed to start server:', err)
      process.exit(1)
    }
  })
}

startServer()
