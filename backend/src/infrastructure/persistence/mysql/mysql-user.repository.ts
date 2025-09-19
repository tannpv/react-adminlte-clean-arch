import { Injectable } from '@nestjs/common'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { User } from '../../../domain/entities/user.entity'
import { UserRepository } from '../../../domain/repositories/user.repository'
import { MysqlDatabaseService } from './mysql-database.service'

interface UserRow extends RowDataPacket {
  id: number
  name: string
  email: string
  password_hash: string
}

interface AutoIncrementRow extends RowDataPacket {
  AUTO_INCREMENT: number
}

interface UserRoleRow extends RowDataPacket {
  role_id: number
}

@Injectable()
export class MysqlUserRepository implements UserRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findAll(): Promise<User[]> {
    const [rows] = await this.db.execute<UserRow[]>(
      'SELECT id, name, email, password_hash FROM users ORDER BY id ASC',
    )
    const users = await Promise.all(rows.map((row) => this.hydrateUser(row)))
    return users
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await this.db.execute<UserRow[]>(
      'SELECT id, name, email, password_hash FROM users WHERE id = ? LIMIT 1',
      [id],
    )
    if (!rows.length) return null
    return this.hydrateUser(rows[0])
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await this.db.execute<UserRow[]>(
      'SELECT id, name, email, password_hash FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [email],
    )
    if (!rows.length) return null
    return this.hydrateUser(rows[0])
  }

  async create(user: User): Promise<User> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [user.name, user.email, user.passwordHash],
    )
    const id = result.insertId as number
    await this.saveRoles(id, user.roles)
    return new User(id, user.name, user.email, [...user.roles], user.passwordHash)
  }

  async update(user: User): Promise<User> {
    await this.db.execute<ResultSetHeader>(
      'UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?',
      [user.name, user.email, user.passwordHash, user.id],
    )
    await this.db.execute('DELETE FROM user_roles WHERE user_id = ?', [user.id])
    await this.saveRoles(user.id, user.roles)
    return user.clone()
  }

  async remove(id: number): Promise<User | null> {
    const existing = await this.findById(id)
    if (!existing) return null
    await this.db.execute('DELETE FROM users WHERE id = ?', [id])
    return existing
  }

  async nextId(): Promise<number> {
    const database = this.db.getDatabaseName()
    const [rows] = await this.db.execute<AutoIncrementRow[]>(
      `SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
      [database],
    )
    const nextId = rows[0]?.AUTO_INCREMENT
    return nextId ? Number(nextId) : 1
  }

  private async hydrateUser(row: UserRow): Promise<User> {
    const [roleRows] = await this.db.execute<UserRoleRow[]>(
      'SELECT role_id FROM user_roles WHERE user_id = ?',
      [row.id],
    )
    const roleIds = roleRows.map((r) => Number(r.role_id))
    return new User(row.id, row.name, row.email, roleIds, row.password_hash)
  }

  private async saveRoles(userId: number, roles: number[]): Promise<void> {
    if (!roles || !roles.length) return
    const placeholders = roles.map(() => '(?, ?)').join(', ')
    const params = roles.flatMap((roleId) => [userId, roleId])
    await this.db.execute(
      `INSERT IGNORE INTO user_roles (user_id, role_id) VALUES ${placeholders}`,
      params,
    )
  }
}
