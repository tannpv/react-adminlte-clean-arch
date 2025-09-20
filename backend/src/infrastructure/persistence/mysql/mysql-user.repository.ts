import { Injectable } from '@nestjs/common'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { User } from '../../../domain/entities/user.entity'
import { UserProfile } from '../../../domain/entities/user-profile.entity'
import { UserRepository } from '../../../domain/repositories/user.repository'
import { MysqlDatabaseService } from './mysql-database.service'

interface UserRow extends RowDataPacket {
  id: number
  email: string
  password_hash: string
}

interface AutoIncrementRow extends RowDataPacket {
  AUTO_INCREMENT: number
}

interface UserRoleRow extends RowDataPacket {
  role_id: number
}

interface UserProfileRow extends RowDataPacket {
  user_id: number
  first_name: string
  last_name: string | null
  date_of_birth: Date | null
  picture_url: string | null
}

@Injectable()
export class MysqlUserRepository implements UserRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findAll(params: { search?: string } = {}): Promise<User[]> {
    const search = params.search?.trim().toLowerCase()

    let query = 'SELECT DISTINCT u.id, u.email, u.password_hash FROM users u'
    const conditions: string[] = []
    const values: unknown[] = []

    if (search) {
      query += `
        LEFT JOIN user_profiles up ON up.user_id = u.id
        LEFT JOIN user_roles ur ON ur.user_id = u.id
        LEFT JOIN roles r ON r.id = ur.role_id`
      const like = `%${search}%`
      conditions.push(
        'LOWER(u.email) LIKE ? OR LOWER(COALESCE(up.first_name, \'\')) LIKE ? OR LOWER(COALESCE(up.last_name, \'\')) LIKE ? OR LOWER(COALESCE(r.name, \'\')) LIKE ?',
      )
      values.push(like, like, like, like)
    }

    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    query += ' ORDER BY u.id ASC'

    const [rows] = await this.db.execute<UserRow[]>(query, values)
    const users = await Promise.all(rows.map((row) => this.hydrateUser(row)))
    return users
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await this.db.execute<UserRow[]>(
      'SELECT id, email, password_hash FROM users WHERE id = ? LIMIT 1',
      [id],
    )
    if (!rows.length) return null
    return this.hydrateUser(rows[0])
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await this.db.execute<UserRow[]>(
      'SELECT id, email, password_hash FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [email],
    )
    if (!rows.length) return null
    return this.hydrateUser(rows[0])
  }

  async create(user: User): Promise<User> {
    const [result] = await this.db.execute<ResultSetHeader>(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [user.email, user.passwordHash],
    )
    const id = result.insertId as number
    await this.saveRoles(id, user.roles)
    await this.saveProfile(id, user.profile)
    return (await this.findById(id)) ?? user.clone()
  }

  async update(user: User): Promise<User> {
    await this.db.execute<ResultSetHeader>(
      'UPDATE users SET email = ?, password_hash = ? WHERE id = ?',
      [user.email, user.passwordHash, user.id],
    )
    await this.db.execute('DELETE FROM user_roles WHERE user_id = ?', [user.id])
    await this.saveRoles(user.id, user.roles)
    await this.saveProfile(user.id, user.profile)
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
    const profileRow = await this.loadProfile(row.id)
    const user = new User(row.id, row.email, roleIds, row.password_hash)
    if (profileRow) {
      user.profile = new UserProfile({
        userId: row.id,
        firstName: profileRow.first_name,
        lastName: profileRow.last_name,
        dateOfBirth: profileRow.date_of_birth ? new Date(profileRow.date_of_birth) : null,
        pictureUrl: profileRow.picture_url,
      })
    }
    return user
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

  private async saveProfile(userId: number, profile: UserProfile | null): Promise<void> {
    if (!profile) {
      await this.db.execute('DELETE FROM user_profiles WHERE user_id = ?', [userId])
      return
    }

    await this.db.execute(
      `INSERT INTO user_profiles (user_id, first_name, last_name, date_of_birth, picture_url)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         first_name = VALUES(first_name),
         last_name = VALUES(last_name),
         date_of_birth = VALUES(date_of_birth),
         picture_url = VALUES(picture_url)`,
      [
        userId,
        profile.firstName,
        profile.lastName,
        profile.dateOfBirth ? profile.dateOfBirth.toISOString().split('T')[0] : null,
        profile.pictureUrl,
      ],
    )
  }

  private async loadProfile(userId: number): Promise<UserProfileRow | null> {
    const [rows] = await this.db.execute<UserProfileRow[]>(
      'SELECT user_id, first_name, last_name, date_of_birth, picture_url FROM user_profiles WHERE user_id = ? LIMIT 1',
      [userId],
    )
    return rows[0] ?? null
  }
}
