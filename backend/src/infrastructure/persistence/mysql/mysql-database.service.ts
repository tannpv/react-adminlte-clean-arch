import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import {
  createConnection,
  createPool,
  FieldPacket,
  OkPacket,
  Pool,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise'
import { PasswordService } from '../../../shared/password.service'
import {
  DEFAULT_ADMIN_PERMISSIONS,
  DEFAULT_USER_PASSWORD,
  DEFAULT_USER_PERMISSIONS,
} from '../../../shared/constants'

export interface MysqlConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

@Injectable()
export class MysqlDatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MysqlDatabaseService.name)
  private pool: Pool | null = null
  private readonly config: MysqlConfig

  constructor(private readonly passwordService: PasswordService) {
    const host = process.env.DB_HOST !== undefined ? process.env.DB_HOST : 'localhost'
    const portRaw = process.env.DB_PORT !== undefined ? process.env.DB_PORT : '7777'
    const user = process.env.DB_USER !== undefined ? process.env.DB_USER : 'root'
    const password = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'password'
    const database = process.env.DB_NAME !== undefined ? process.env.DB_NAME : 'adminlte'

    this.config = {
      host,
      port: Number(portRaw) || 7777,
      user,
      password,
      database,
    }
  }

  async onModuleInit(): Promise<void> {
    await this.initialize()
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
    }
  }

  getPool(): Pool {
    if (!this.pool) {
      throw new Error('MySQL pool not initialised')
    }
    return this.pool
  }

  getDatabaseName(): string {
    return this.config.database
  }

  private async initialize(): Promise<void> {
    const { host, port, user, password, database } = this.config
    const connection = await createConnection({ host, port, user, password })
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
    await connection.end()

    this.pool = createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
    })

    await this.runMigrations()
    this.logger.log(`Connected to MySQL database ${database} on ${host}:${port}`)
  }

  private async runMigrations(): Promise<void> {
    await this.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      ) ENGINE=InnoDB;
    `)

    await this.execute(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INT NOT NULL,
        permission VARCHAR(255) NOT NULL,
        PRIMARY KEY (role_id, permission),
        CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id)
          REFERENCES roles(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `)

    await this.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB;
    `)

    await this.execute(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        PRIMARY KEY (user_id, role_id),
        CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id)
          REFERENCES roles(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `)

    await this.seedDefaults()
  }

  private async seedDefaults(): Promise<void> {
    const [roleCountRows] = await this.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM roles',
    )
    const roleCount = Number(roleCountRows[0]?.count ?? 0)

    if (roleCount === 0) {
      const adminId = await this.insertRole('Admin', DEFAULT_ADMIN_PERMISSIONS)
      const userId = await this.insertRole('User', DEFAULT_USER_PERMISSIONS)
      this.logger.log(`Seeded default roles (Admin=${adminId}, User=${userId})`)
    } else {
      // Ensure roles have default permissions if missing
      const [roles] = await this.execute<RowDataPacket[]>(
        'SELECT id, name FROM roles',
      )
      for (const role of roles) {
        const [existingPermissions] = await this.execute<RowDataPacket[]>(
          'SELECT permission FROM role_permissions WHERE role_id = ?',
          [role.id],
        )
        if (existingPermissions.length === 0) {
          const perms = role.name.toLowerCase() === 'admin'
            ? DEFAULT_ADMIN_PERMISSIONS
            : role.name.toLowerCase() === 'user'
              ? DEFAULT_USER_PERMISSIONS
              : ['users:read']
          await this.insertPermissions(role.id, perms)
        }
      }
    }

    const [userCountRows] = await this.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users',
    )
    const userCount = Number(userCountRows[0]?.count ?? 0)

    if (userCount === 0) {
      const passwordHash = this.passwordService.hashSync(DEFAULT_USER_PASSWORD)
      const [result] = await this.execute<ResultSetHeader>(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        ['Leanne Graham', 'leanne@example.com', passwordHash],
      )
      const userId = result.insertId as number
      const [adminRoles] = await this.execute<RowDataPacket[]>(
        "SELECT id FROM roles WHERE LOWER(name) = 'admin' LIMIT 1",
      )
      const adminRoleId = adminRoles[0]?.id
      if (adminRoleId) {
        await this.execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, adminRoleId])
      }
      this.logger.log(`Seeded default admin user (ID=${userId})`)
    } else {
      await this.ensureUsersHavePasswords()
    }
  }

  private async ensureUsersHavePasswords(): Promise<void> {
    const [users] = await this.execute<RowDataPacket[]>(
      'SELECT id, password_hash FROM users',
    )
    for (const user of users) {
      if (!user.password_hash) {
        const hash = this.passwordService.hashSync(DEFAULT_USER_PASSWORD)
        await this.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user.id])
      }
    }
  }

  private async insertRole(name: string, permissions: string[]): Promise<number> {
    const [result] = await this.execute<ResultSetHeader>(
      'INSERT INTO roles (name) VALUES (?)',
      [name],
    )
    const roleId = result.insertId as number
    await this.insertPermissions(roleId, permissions)
    return roleId
  }

  private async insertPermissions(roleId: number, permissions: string[]): Promise<void> {
    if (!permissions.length) return
    const placeholders = permissions.map(() => '(?, ?)').join(', ')
    const params = permissions.flatMap((perm) => [roleId, perm])
    await this.execute(`INSERT IGNORE INTO role_permissions (role_id, permission) VALUES ${placeholders}`, params)
  }

  async execute<
    T extends RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader = RowDataPacket[],
  >(sql: string, params?: any): Promise<[T, FieldPacket[]]> {
    const pool = this.getPool()
    return pool.query<T>(sql, params)
  }
}
