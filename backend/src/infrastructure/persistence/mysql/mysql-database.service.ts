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
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sku VARCHAR(64) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        price_cents INT NOT NULL,
        currency VARCHAR(8) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'draft',
        type VARCHAR(32) NOT NULL DEFAULT 'simple',
        metadata JSON NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        INDEX idx_products_status (status),
        INDEX idx_products_type (type),
        INDEX idx_products_updated_at (updated_at)
      ) ENGINE=InnoDB;
    `)

    const [productTypeColumn] = await this.execute<RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'type'`,
      [this.config.database],
    )

    if (!productTypeColumn.length) {
      await this.execute("ALTER TABLE products ADD COLUMN type VARCHAR(32) NOT NULL DEFAULT 'simple' AFTER status")
      await this.execute("UPDATE products SET type = 'simple' WHERE type IS NULL OR type = ''")
    }

    await this.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        parent_id INT NULL,
        CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id)
          REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_categories_parent (parent_id)
      ) ENGINE=InnoDB;
    `)

    const [categoryParentColumn] = await this.execute<RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'parent_id'`,
      [this.config.database],
    )

    if (!categoryParentColumn.length) {
      await this.execute('ALTER TABLE categories ADD COLUMN parent_id INT NULL')
    }

    try {
      await this.execute('CREATE INDEX idx_categories_parent ON categories(parent_id)')
    } catch (e) {
      // ignore if index already exists
    }

    try {
      await this.execute(`
        ALTER TABLE categories
        ADD CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id)
          REFERENCES categories(id) ON DELETE SET NULL
      `)
    } catch (e) {
      // ignore if already applied
    }

    await this.execute(`
      CREATE TABLE IF NOT EXISTS product_categories (
        product_id INT NOT NULL,
        category_id INT NOT NULL,
        PRIMARY KEY (product_id, category_id),
        CONSTRAINT fk_product_categories_product FOREIGN KEY (product_id)
          REFERENCES products(id) ON DELETE CASCADE,
        CONSTRAINT fk_product_categories_category FOREIGN KEY (category_id)
          REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `)

    await this.execute(`
      CREATE TABLE IF NOT EXISTS product_attributes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NULL,
        input_type VARCHAR(32) NOT NULL DEFAULT 'select',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      ) ENGINE=InnoDB;
    `)

    await this.execute(`
      CREATE TABLE IF NOT EXISTS product_attribute_terms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        attribute_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        metadata JSON NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        UNIQUE KEY uniq_attribute_term_slug (attribute_id, slug),
        CONSTRAINT fk_attribute_terms_attribute FOREIGN KEY (attribute_id)
          REFERENCES product_attributes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `)

    await this.execute(`
      CREATE TABLE IF NOT EXISTS product_attribute_assignments (
        product_id INT NOT NULL,
        attribute_id INT NOT NULL,
        is_visible TINYINT(1) NOT NULL DEFAULT 1,
        is_variation TINYINT(1) NOT NULL DEFAULT 0,
        sort_order INT NOT NULL DEFAULT 0,
        PRIMARY KEY (product_id, attribute_id),
        CONSTRAINT fk_attribute_assignments_product FOREIGN KEY (product_id)
          REFERENCES products(id) ON DELETE CASCADE,
        CONSTRAINT fk_attribute_assignments_attribute FOREIGN KEY (attribute_id)
          REFERENCES product_attributes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `)

    await this.execute(`
      CREATE TABLE IF NOT EXISTS product_attribute_assignment_terms (
        product_id INT NOT NULL,
        attribute_id INT NOT NULL,
        term_id INT NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        PRIMARY KEY (product_id, attribute_id, term_id),
        CONSTRAINT fk_assignment_terms_product FOREIGN KEY (product_id)
          REFERENCES products(id) ON DELETE CASCADE,
        CONSTRAINT fk_assignment_terms_attribute FOREIGN KEY (attribute_id)
          REFERENCES product_attributes(id) ON DELETE CASCADE,
        CONSTRAINT fk_assignment_terms_term FOREIGN KEY (term_id)
          REFERENCES product_attribute_terms(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `)

    try {
      await this.execute('ALTER TABLE product_attribute_assignment_terms ADD COLUMN sort_order INT NOT NULL DEFAULT 0')
    } catch (e) {
      // ignore if already applied
    }

    await this.execute(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        sku VARCHAR(64) NOT NULL,
        price_cents INT NOT NULL,
        sale_price_cents INT NULL,
        currency VARCHAR(8) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'draft',
        stock_quantity INT NULL,
        metadata JSON NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        UNIQUE KEY uniq_product_variant_sku (sku),
        INDEX idx_product_variants_product (product_id),
        CONSTRAINT fk_product_variants_product FOREIGN KEY (product_id)
          REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `)

    await this.execute(`
      CREATE TABLE IF NOT EXISTS product_variant_attribute_values (
        variant_id INT NOT NULL,
        attribute_id INT NOT NULL,
        term_id INT NOT NULL,
        PRIMARY KEY (variant_id, attribute_id),
        CONSTRAINT fk_variant_values_variant FOREIGN KEY (variant_id)
          REFERENCES product_variants(id) ON DELETE CASCADE,
        CONSTRAINT fk_variant_values_attribute FOREIGN KEY (attribute_id)
          REFERENCES product_attributes(id) ON DELETE CASCADE,
        CONSTRAINT fk_variant_values_term FOREIGN KEY (term_id)
          REFERENCES product_attribute_terms(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `)

    await this.execute(`
      CREATE TABLE IF NOT EXISTS product_attribute_sets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      ) ENGINE=InnoDB;
    `)

    await this.execute(`
      CREATE TABLE IF NOT EXISTS product_attribute_set_attributes (
        set_id INT NOT NULL,
        attribute_id INT NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        PRIMARY KEY (set_id, attribute_id),
        CONSTRAINT fk_set_attributes_set FOREIGN KEY (set_id)
          REFERENCES product_attribute_sets(id) ON DELETE CASCADE,
        CONSTRAINT fk_set_attributes_attribute FOREIGN KEY (attribute_id)
          REFERENCES product_attributes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `)

    try {
      await this.execute("ALTER TABLE products ADD COLUMN attribute_set_id INT NULL AFTER metadata")
    } catch (e) {
      // ignore if column already exists
    }

    try {
      await this.execute('CREATE INDEX idx_products_attribute_set ON products(attribute_set_id)')
    } catch (e) {
      // ignore if index already exists
    }

    try {
      await this.execute(`
        ALTER TABLE products
        ADD CONSTRAINT fk_products_attribute_set FOREIGN KEY (attribute_set_id)
          REFERENCES product_attribute_sets(id) ON DELETE SET NULL
      `)
    } catch (e) {
      // ignore if already applied
    }

    const now = new Date()
    const [defaultSetRows] = await this.execute<RowDataPacket[]>(
      'SELECT id FROM product_attribute_sets WHERE slug = ? LIMIT 1',
      ['default'],
    )

    let defaultSetId = defaultSetRows[0]?.id as number | undefined
    if (!defaultSetId) {
      const [insertResult] = await this.execute<ResultSetHeader>(
        'INSERT INTO product_attribute_sets (name, slug, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        ['Default', 'default', null, now, now],
      )
      defaultSetId = insertResult.insertId as number
    }

    await this.execute(
      'UPDATE products SET attribute_set_id = ? WHERE attribute_set_id IS NULL',
      [defaultSetId ?? 1],
    )

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
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB;
    `)

    await this.execute(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id INT NOT NULL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NULL,
        date_of_birth DATE NULL,
        picture_url LONGTEXT NULL,
        CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `)

    try {
      await this.execute('ALTER TABLE user_profiles MODIFY COLUMN picture_url LONGTEXT NULL')
    } catch (e) {
      // ignore if already applied
    }

    const [nameColumnRows] = await this.execute<RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'name'`,
      [this.config.database],
    )

    if (nameColumnRows.length) {
      await this.execute(
        `INSERT INTO user_profiles (user_id, first_name, last_name)
         SELECT u.id,
                COALESCE(NULLIF(TRIM(SUBSTRING_INDEX(u.name, ' ', 1)), ''), 'User'),
                COALESCE(NULLIF(TRIM(SUBSTRING_INDEX(u.name, ' ', -1)), ''), 'User')
         FROM users u
         WHERE NOT EXISTS (
           SELECT 1 FROM user_profiles p WHERE p.user_id = u.id
         );`,
      )

      try {
        await this.execute('ALTER TABLE users DROP COLUMN name')
      } catch (e) {
        // ignore
      }
    }

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

    await this.execute(`
      CREATE TABLE IF NOT EXISTS file_directories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT NOT NULL,
        parent_id INT NULL,
        name VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        CONSTRAINT fk_file_directories_owner FOREIGN KEY (owner_id)
          REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_file_directories_parent FOREIGN KEY (parent_id)
          REFERENCES file_directories(id) ON DELETE CASCADE,
        UNIQUE KEY uniq_directory_name (owner_id, parent_id, name)
      ) ENGINE=InnoDB;
    `)

    await this.execute(`
      CREATE TABLE IF NOT EXISTS files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        directory_id INT NULL,
        owner_id INT NOT NULL,
        original_name VARCHAR(512) NOT NULL,
        display_name VARCHAR(512) NOT NULL,
        storage_key VARCHAR(512) NOT NULL,
        mime_type VARCHAR(255) NULL,
        size_bytes BIGINT NULL,
        visibility VARCHAR(32) NOT NULL DEFAULT 'private',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        CONSTRAINT fk_files_owner FOREIGN KEY (owner_id)
          REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_files_directory FOREIGN KEY (directory_id)
          REFERENCES file_directories(id) ON DELETE SET NULL,
        INDEX idx_files_directory (directory_id),
        INDEX idx_files_owner (owner_id)
      ) ENGINE=InnoDB;
    `)

    await this.execute(`
      CREATE TABLE IF NOT EXISTS file_grants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        entity_type ENUM('file','directory') NOT NULL,
        entity_id INT NOT NULL,
        role_id INT NOT NULL,
        access ENUM('read','write') NOT NULL DEFAULT 'read',
        UNIQUE KEY uniq_entity_role (entity_type, entity_id, role_id, access),
        INDEX idx_grants_role (role_id),
        CONSTRAINT fk_file_grants_role FOREIGN KEY (role_id)
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
      // Ensure roles have default permissions; add any missing perms
      const [roles] = await this.execute<RowDataPacket[]>(
        'SELECT id, name FROM roles',
      )
      for (const role of roles) {
        const [existingPermissions] = await this.execute<RowDataPacket[]>(
          'SELECT permission FROM role_permissions WHERE role_id = ?',
          [role.id],
        )
        const existingSet = new Set(existingPermissions.map((row) => row.permission))
        const desired = role.name.toLowerCase() === 'admin'
          ? DEFAULT_ADMIN_PERMISSIONS
          : role.name.toLowerCase() === 'user'
            ? DEFAULT_USER_PERMISSIONS
            : ['users:read']
        const missing = desired.filter((perm) => !existingSet.has(perm))
        if (missing.length) {
          await this.insertPermissions(role.id, missing)
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
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        ['leanne@example.com', passwordHash],
      )
      const userId = result.insertId as number
      await this.execute(
        'INSERT INTO user_profiles (user_id, first_name, last_name, picture_url) VALUES (?, ?, ?, ?)',
        [userId, 'Leanne', 'Graham', null],
      )
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

    await this.ensureDefaultCategories()
    await this.ensureSampleProduct()
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

  private async ensureSampleProduct(): Promise<void> {
    const [countRows] = await this.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM products',
    )
    const count = Number(countRows[0]?.count ?? 0)
    if (count > 0) return

    const now = new Date()
    const [result] = await this.execute<ResultSetHeader>(
      `INSERT INTO products (sku, name, description, price_cents, currency, status, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'SKU-001',
        'Sample Product',
        'This is a placeholder product seeded for local development.',
        1999,
        'USD',
        'published',
        JSON.stringify({ tags: ['sample'] }),
        now,
        now,
      ],
    )
    const productId = result.insertId as number

    const [category] = await this.execute<RowDataPacket[]>(
      'SELECT id FROM categories ORDER BY id ASC LIMIT 1',
    )
    const categoryId = category[0]?.id
    if (categoryId) {
      await this.execute(
        'INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)',
        [productId, categoryId],
      )
    }
    this.logger.log('Seeded sample product (SKU=SKU-001)')
  }

  private async ensureDefaultCategories(): Promise<void> {
    const [countRows] = await this.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM categories',
    )
    const count = Number(countRows[0]?.count ?? 0)
    if (count > 0) return

    const defaults = ['Electronics', 'Apparel', 'Books']
    const placeholders = defaults.map(() => '(?)').join(', ')
    await this.execute(`INSERT INTO categories (name) VALUES ${placeholders}`, defaults)
    this.logger.log('Seeded default categories')
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
