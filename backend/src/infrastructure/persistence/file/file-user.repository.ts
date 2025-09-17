import { Injectable } from '@nestjs/common'
import { User } from '../../../domain/entities/user.entity'
import { UserRepository } from '../../../domain/repositories/user.repository'
import { FileDatabaseService, RawUser } from './file-database.service'

@Injectable()
export class FileUserRepository implements UserRepository {
  constructor(private readonly db: FileDatabaseService) {}

  async findAll(): Promise<User[]> {
    const data = await this.db.read()
    return data.users.map((user) => this.toDomain(user))
  }

  async findById(id: number): Promise<User | null> {
    const data = await this.db.read()
    const raw = data.users.find((user) => user.id === id)
    return raw ? this.toDomain(raw) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const lower = email.toLowerCase()
    const data = await this.db.read()
    const raw = data.users.find((user) => user.email.toLowerCase() === lower)
    return raw ? this.toDomain(raw) : null
  }

  async create(user: User): Promise<User> {
    const raw = this.toRaw(user)
    await this.db.update(async (db) => {
      db.users.push(raw)
    })
    return user
  }

  async update(user: User): Promise<User> {
    await this.db.update(async (db) => {
      const idx = db.users.findIndex((u) => u.id === user.id)
      if (idx === -1) return
      db.users[idx] = this.toRaw(user)
    })
    return user
  }

  async remove(id: number): Promise<User | null> {
    let removed: User | null = null
    await this.db.update(async (db) => {
      const idx = db.users.findIndex((u) => u.id === id)
      if (idx === -1) return
      const [raw] = db.users.splice(idx, 1)
      removed = this.toDomain(raw)
    })
    return removed
  }

  async nextId(): Promise<number> {
    const data = await this.db.read()
    const max = data.users.reduce((acc, user) => (user.id > acc ? user.id : acc), 0)
    return max + 1
  }

  private toDomain(raw: RawUser): User {
    const roles = Array.isArray(raw.roles) ? raw.roles.map((roleId) => Number(roleId)).filter((roleId) => Number.isInteger(roleId)) : []
    return new User(raw.id, raw.name, raw.email, roles, raw.passwordHash || '')
  }

  private toRaw(user: User): RawUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: [...user.roles],
      passwordHash: user.passwordHash,
    }
  }
}
