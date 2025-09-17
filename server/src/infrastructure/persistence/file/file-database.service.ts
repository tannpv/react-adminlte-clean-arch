import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { promises as fs } from 'fs'
import path from 'path'
import { DEFAULT_ADMIN_PERMISSIONS, DEFAULT_USER_PERMISSIONS, DEFAULT_USER_PASSWORD } from '../../../shared/constants'
import { PasswordService } from '../../../shared/password.service'

export interface RawUser {
  id: number
  name: string
  email: string
  roles?: number[]
  passwordHash?: string
}

export interface RawRole {
  id: number
  name: string
  permissions?: string[]
}

export interface DatabaseSchema {
  users: RawUser[]
  roles: RawRole[]
}

@Injectable()
export class FileDatabaseService implements OnModuleInit {
  private readonly logger = new Logger(FileDatabaseService.name)
  private readonly dbPath = path.resolve(process.cwd(), 'db.json')

  constructor(private readonly passwordService: PasswordService) {}

  async onModuleInit(): Promise<void> {
    await this.ensureDatabase()
    await this.runMigrations()
  }

  async read(): Promise<DatabaseSchema> {
    await this.ensureDatabase()
    const raw = await fs.readFile(this.dbPath, 'utf-8')
    return JSON.parse(raw) as DatabaseSchema
  }

  async write(db: DatabaseSchema): Promise<void> {
    await fs.writeFile(this.dbPath, JSON.stringify(db, null, 2), 'utf-8')
  }

  async update(mutator: (db: DatabaseSchema) => Promise<DatabaseSchema | void> | DatabaseSchema | void): Promise<DatabaseSchema> {
    const db = await this.read()
    const result = await mutator(db)
    const next = (result as DatabaseSchema) ?? db
    await this.write(next)
    return next
  }

  private async ensureDatabase(): Promise<void> {
    try {
      await fs.access(this.dbPath)
    } catch (_err) {
      await this.seed()
    }
  }

  private async seed(): Promise<void> {
    const passwordHash = this.passwordService.hashSync(DEFAULT_USER_PASSWORD)
    const seed: DatabaseSchema = {
      users: [
        { id: 1, name: 'Leanne Graham', email: 'leanne@example.com', roles: [1], passwordHash },
        { id: 2, name: 'Ervin Howell', email: 'ervin@example.com', roles: [], passwordHash },
      ],
      roles: [
        { id: 1, name: 'Admin', permissions: [...DEFAULT_ADMIN_PERMISSIONS] },
        { id: 2, name: 'User', permissions: [...DEFAULT_USER_PERMISSIONS] },
      ],
    }
    await this.write(seed)
    this.logger.log('Database seeded with default data')
  }

  private async runMigrations(): Promise<void> {
    const db = await this.read()
    let changed = false

    db.users = Array.isArray(db.users) ? db.users : []

    if (!Array.isArray(db.roles) || db.roles.length === 0) {
      db.roles = [
        { id: 1, name: 'Admin', permissions: [...DEFAULT_ADMIN_PERMISSIONS] },
        { id: 2, name: 'User', permissions: [...DEFAULT_USER_PERMISSIONS] },
      ]
      changed = true
    } else {
      db.roles = db.roles.map((role) => {
        const permissions = Array.isArray(role.permissions)
          ? role.permissions.length
            ? [...new Set(role.permissions)]
            : role.name.toLowerCase() === 'admin'
            ? [...DEFAULT_ADMIN_PERMISSIONS]
            : role.name.toLowerCase() === 'user'
            ? [...DEFAULT_USER_PERMISSIONS]
            : []
          : role.name.toLowerCase() === 'admin'
          ? [...DEFAULT_ADMIN_PERMISSIONS]
          : role.name.toLowerCase() === 'user'
          ? [...DEFAULT_USER_PERMISSIONS]
          : []
        const original = Array.isArray(role.permissions) ? [...role.permissions] : []
        const sameLength = original.length === permissions.length
        const sameValues = sameLength && original.every((perm, idx) => perm === permissions[idx])
        if (!sameValues) changed = true
        return { ...role, permissions }
      })
    }

    db.users = db.users.map((user) => {
      let mutated = false
      let passwordHash = user.passwordHash
      if (!passwordHash) {
        passwordHash = this.passwordService.hashSync(DEFAULT_USER_PASSWORD)
        mutated = true
      }
      const roles = Array.isArray(user.roles) ? user.roles.map((id) => Number(id)).filter((id) => Number.isInteger(id)) : []
      if (!Array.isArray(user.roles) || roles.length !== user.roles.length) {
        mutated = true
      }
      if (!roles.length && user.id === 1) {
        roles.push(1)
        mutated = true
      }
      if (mutated) changed = true
      return { ...user, passwordHash, roles }
    })

    if (changed) {
      await this.write(db)
      this.logger.log('Database migrations applied')
    }
  }
}
