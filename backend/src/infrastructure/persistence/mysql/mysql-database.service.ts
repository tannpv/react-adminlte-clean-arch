import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import {
  createConnection,
  createPool,
  FieldPacket,
  OkPacket,
  Pool,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import {
  DEFAULT_ADMIN_PERMISSIONS,
  DEFAULT_TRANSLATOR_PERMISSIONS,
  DEFAULT_USER_PASSWORD,
  DEFAULT_USER_PERMISSIONS,
} from "../../../shared/constants";
import { PasswordService } from "../../../shared/password.service";

export interface MysqlConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

@Injectable()
export class MysqlDatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MysqlDatabaseService.name);
  private pool: Pool | null = null;
  private readonly config: MysqlConfig;

  constructor(private readonly passwordService: PasswordService) {
    const host =
      process.env.DB_HOST !== undefined ? process.env.DB_HOST : "localhost";
    const portRaw =
      process.env.DB_PORT !== undefined ? process.env.DB_PORT : "7777";
    const user =
      process.env.DB_USER !== undefined ? process.env.DB_USER : "root";
    const password =
      process.env.DB_PASSWORD !== undefined
        ? process.env.DB_PASSWORD
        : "password";
    const database =
      process.env.DB_NAME !== undefined ? process.env.DB_NAME : "admin_dashboard";

    this.config = {
      host,
      port: Number(portRaw) || 7777,
      user,
      password,
      database,
    };
  }

  async onModuleInit(): Promise<void> {
    await this.initialize();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  getPool(): Pool {
    if (!this.pool) {
      throw new Error("MySQL pool not initialised");
    }
    return this.pool;
  }

  getDatabaseName(): string {
    return this.config.database;
  }

  private async initialize(): Promise<void> {
    const { host, port, user, password, database } = this.config;
    const connection = await createConnection({ host, port, user, password });
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.end();

    this.pool = createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
    });

    await this.runMigrations();
    this.logger.log(
      `Connected to MySQL database ${database} on ${host}:${port}`
    );
  }

  private async runMigrations(): Promise<void> {
    await this.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      ) ENGINE=InnoDB;
    `);

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
    `);

    const [productTypeColumn] = await this.execute<RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'type'`,
      [this.config.database]
    );

    if (!productTypeColumn.length) {
      await this.execute(
        "ALTER TABLE products ADD COLUMN type VARCHAR(32) NOT NULL DEFAULT 'simple' AFTER status"
      );
      await this.execute(
        "UPDATE products SET type = 'simple' WHERE type IS NULL OR type = ''"
      );
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
    `);

    // Product Attributes System Tables
    await this.execute(`
      CREATE TABLE IF NOT EXISTS attributes (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        code VARCHAR(191) NOT NULL,
        name VARCHAR(191) NOT NULL,
        input_type ENUM('select','multiselect','text','number','boolean') NOT NULL DEFAULT 'select',
        data_type ENUM('string','number','boolean') NOT NULL DEFAULT 'string',
        unit VARCHAR(32) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY ux_attributes_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await this.execute(`
      CREATE TABLE IF NOT EXISTS attribute_values (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        attribute_id BIGINT UNSIGNED NOT NULL,
        value_code VARCHAR(191) NOT NULL,
        label VARCHAR(191) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        CONSTRAINT fk_av_attr FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON UPDATE RESTRICT ON DELETE RESTRICT,
        UNIQUE KEY ux_attribute_value (attribute_id, value_code),
        KEY ix_av_attr (attribute_id),
        KEY ix_av_sort (attribute_id, sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await this.execute(`
      CREATE TABLE IF NOT EXISTS attribute_sets (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        is_system BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY ux_attribute_sets_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await this.execute(`
      CREATE TABLE IF NOT EXISTS attribute_set_assignments (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        attribute_set_id BIGINT UNSIGNED NOT NULL,
        attribute_id BIGINT UNSIGNED NOT NULL,
        sort_order INT DEFAULT 0,
        is_required BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_asa_set FOREIGN KEY (attribute_set_id) REFERENCES attribute_sets(id) ON DELETE CASCADE,
        CONSTRAINT fk_asa_attr FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE,
        UNIQUE KEY ux_set_attribute (attribute_set_id, attribute_id),
        KEY ix_asa_set (attribute_set_id),
        KEY ix_asa_sort (attribute_set_id, sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Product Attribute Values Table (Normalized Structure)
    await this.execute(`
      CREATE TABLE IF NOT EXISTS product_attribute_values (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        attribute_id BIGINT UNSIGNED NOT NULL,
        attribute_value_id BIGINT UNSIGNED NULL,
        value_text TEXT NULL,
        value_number DECIMAL(15,4) NULL,
        value_boolean BOOLEAN NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_pav_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        CONSTRAINT fk_pav_attribute FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE,
        CONSTRAINT fk_pav_attribute_value FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON DELETE CASCADE,
        KEY ix_pav_product (product_id),
        KEY ix_pav_attribute (attribute_id),
        KEY ix_pav_attribute_value (attribute_value_id),
        KEY ix_product_attribute_value (product_id, attribute_id, attribute_value_id),
        KEY ix_attribute_value_product (attribute_value_id, product_id),
        KEY ix_value_text (value_text(191)),
        KEY ix_value_number (value_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Product Variants Table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        sku VARCHAR(191) NOT NULL,
        name VARCHAR(255) NOT NULL,
        price_cents INT NOT NULL DEFAULT 0,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_pv_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY ux_variant_sku (sku),
        KEY ix_pv_product (product_id),
        KEY ix_pv_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Product Variant Attribute Values Table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS product_variant_attribute_values (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        variant_id BIGINT UNSIGNED NOT NULL,
        attribute_id BIGINT UNSIGNED NOT NULL,
        value_text TEXT NULL,
        value_number DECIMAL(15,4) NULL,
        value_boolean BOOLEAN NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_pvav_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
        CONSTRAINT fk_pvav_attribute FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE,
        UNIQUE KEY ux_variant_attribute (variant_id, attribute_id),
        KEY ix_pvav_variant (variant_id),
        KEY ix_pvav_attribute (attribute_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure normalized schema is applied to product_attribute_values
    await this.ensureNormalizedSchema();

    const [categoryParentColumn] = await this.execute<RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'parent_id'`,
      [this.config.database]
    );

    if (!categoryParentColumn.length) {
      await this.execute(
        "ALTER TABLE categories ADD COLUMN parent_id INT NULL"
      );
    }

    try {
      await this.execute(
        "CREATE INDEX idx_categories_parent ON categories(parent_id)"
      );
    } catch (e) {
      // ignore if index already exists
    }

    try {
      await this.execute(`
        ALTER TABLE categories
        ADD CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id)
          REFERENCES categories(id) ON DELETE SET NULL
      `);
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
    `);

    await this.execute(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INT NOT NULL,
        permission VARCHAR(255) NOT NULL,
        PRIMARY KEY (role_id, permission),
        CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id)
          REFERENCES roles(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await this.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB;
    `);

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
    `);

    try {
      await this.execute(
        "ALTER TABLE user_profiles MODIFY COLUMN picture_url LONGTEXT NULL"
      );
    } catch (e) {
      // ignore if already applied
    }

    const [nameColumnRows] = await this.execute<RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'name'`,
      [this.config.database]
    );

    if (nameColumnRows.length) {
      await this.execute(
        `INSERT INTO user_profiles (user_id, first_name, last_name)
         SELECT u.id,
                COALESCE(NULLIF(TRIM(SUBSTRING_INDEX(u.name, ' ', 1)), ''), 'User'),
                COALESCE(NULLIF(TRIM(SUBSTRING_INDEX(u.name, ' ', -1)), ''), 'User')
         FROM users u
         WHERE NOT EXISTS (
           SELECT 1 FROM user_profiles p WHERE p.user_id = u.id
         );`
      );

      try {
        await this.execute("ALTER TABLE users DROP COLUMN name");
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
    `);

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
    `);

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
    `);

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
    `);

    // Translation system tables
    await this.execute(`
      CREATE TABLE IF NOT EXISTS languages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(5) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        nativeName VARCHAR(100) NOT NULL,
        isDefault BOOLEAN NOT NULL DEFAULT FALSE,
        isActive BOOLEAN NOT NULL DEFAULT TRUE,
        flagIcon VARCHAR(10) NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_languages_code (code),
        INDEX idx_languages_active (isActive),
        INDEX idx_languages_default (isDefault)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await this.execute(`
      CREATE TABLE IF NOT EXISTS translation_namespaces (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255) NULL,
        isActive BOOLEAN NOT NULL DEFAULT TRUE,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_namespaces_name (name),
        INDEX idx_namespaces_active (isActive)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await this.execute(`
      CREATE TABLE IF NOT EXISTS translation_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_path VARCHAR(255) NOT NULL,
        description VARCHAR(500) NULL,
        isActive BOOLEAN NOT NULL DEFAULT TRUE,
        namespaceId INT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_translation_keys_namespace FOREIGN KEY (namespaceId)
          REFERENCES translation_namespaces(id) ON DELETE CASCADE,
        INDEX idx_translation_keys_namespace (namespaceId),
        INDEX idx_translation_keys_path (key_path),
        INDEX idx_translation_keys_active (isActive),
        UNIQUE KEY uniq_key_namespace (key_path, namespaceId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await this.execute(`
      CREATE TABLE IF NOT EXISTS translations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        value TEXT NOT NULL,
        notes TEXT NULL,
        isActive BOOLEAN NOT NULL DEFAULT TRUE,
        languageId INT NOT NULL,
        keyId INT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_translations_language FOREIGN KEY (languageId)
          REFERENCES languages(id) ON DELETE CASCADE,
        CONSTRAINT fk_translations_key FOREIGN KEY (keyId)
          REFERENCES translation_keys(id) ON DELETE CASCADE,
        INDEX idx_translations_language_key (languageId, keyId),
        INDEX idx_translations_active (isActive),
        UNIQUE KEY uniq_translation_language_key (languageId, keyId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await this.seedDefaults();
  }

  private async seedDefaults(): Promise<void> {
    const [roleCountRows] = await this.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM roles"
    );
    const roleCount = Number(roleCountRows[0]?.count ?? 0);

    if (roleCount === 0) {
      const adminId = await this.insertRole("Admin", DEFAULT_ADMIN_PERMISSIONS);
      const userId = await this.insertRole("User", DEFAULT_USER_PERMISSIONS);
      const translatorId = await this.insertRole(
        "Translator",
        DEFAULT_TRANSLATOR_PERMISSIONS
      );
      this.logger.log(
        `Seeded default roles (Admin=${adminId}, User=${userId}, Translator=${translatorId})`
      );
    } else {
      // Ensure roles have default permissions; add any missing perms
      const [roles] = await this.execute<RowDataPacket[]>(
        "SELECT id, name FROM roles"
      );
      for (const role of roles) {
        const [existingPermissions] = await this.execute<RowDataPacket[]>(
          "SELECT permission FROM role_permissions WHERE role_id = ?",
          [role.id]
        );
        const existingSet = new Set(
          existingPermissions.map((row) => row.permission)
        );
        const desired =
          role.name.toLowerCase() === "admin"
            ? DEFAULT_ADMIN_PERMISSIONS
            : role.name.toLowerCase() === "user"
            ? DEFAULT_USER_PERMISSIONS
            : role.name.toLowerCase() === "translator"
            ? DEFAULT_TRANSLATOR_PERMISSIONS
            : ["users:read"];
        const missing = desired.filter((perm) => !existingSet.has(perm));
        if (missing.length) {
          await this.insertPermissions(role.id, missing);
        }
      }
    }

    const [userCountRows] = await this.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM users"
    );
    const userCount = Number(userCountRows[0]?.count ?? 0);

    if (userCount === 0) {
      const passwordHash = this.passwordService.hashSync(DEFAULT_USER_PASSWORD);
      const [result] = await this.execute<ResultSetHeader>(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        ["leanne@example.com", passwordHash]
      );
      const userId = result.insertId as number;
      await this.execute(
        "INSERT INTO user_profiles (user_id, first_name, last_name, picture_url) VALUES (?, ?, ?, ?)",
        [userId, "Leanne", "Graham", null]
      );
      const [adminRoles] = await this.execute<RowDataPacket[]>(
        "SELECT id FROM roles WHERE LOWER(name) = 'admin' LIMIT 1"
      );
      const adminRoleId = adminRoles[0]?.id;
      if (adminRoleId) {
        await this.execute(
          "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
          [userId, adminRoleId]
        );
      }
      this.logger.log(`Seeded default admin user (ID=${userId})`);
    } else {
      await this.ensureUsersHavePasswords();
    }

    await this.ensureDefaultCategories();
    await this.ensureSampleProduct();
    await this.seedDefaultAttributes();
    await this.seedDefaultTranslations();
  }

  private async ensureUsersHavePasswords(): Promise<void> {
    const [users] = await this.execute<RowDataPacket[]>(
      "SELECT id, password_hash FROM users"
    );
    for (const user of users) {
      if (!user.password_hash) {
        const hash = this.passwordService.hashSync(DEFAULT_USER_PASSWORD);
        await this.execute("UPDATE users SET password_hash = ? WHERE id = ?", [
          hash,
          user.id,
        ]);
      }
    }
  }

  private async insertRole(
    name: string,
    permissions: string[]
  ): Promise<number> {
    const [result] = await this.execute<ResultSetHeader>(
      "INSERT INTO roles (name) VALUES (?)",
      [name]
    );
    const roleId = result.insertId as number;
    await this.insertPermissions(roleId, permissions);
    return roleId;
  }

  private async ensureSampleProduct(): Promise<void> {
    const [countRows] = await this.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM products"
    );
    const count = Number(countRows[0]?.count ?? 0);
    if (count > 0) return;

    const now = new Date();
    const [result] = await this.execute<ResultSetHeader>(
      `INSERT INTO products (sku, name, description, price_cents, currency, status, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "SKU-001",
        "Sample Product",
        "This is a placeholder product seeded for local development.",
        1999,
        "USD",
        "published",
        JSON.stringify({ tags: ["sample"] }),
        now,
        now,
      ]
    );
    const productId = result.insertId as number;

    const [category] = await this.execute<RowDataPacket[]>(
      "SELECT id FROM categories ORDER BY id ASC LIMIT 1"
    );
    const categoryId = category[0]?.id;
    if (categoryId) {
      await this.execute(
        "INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)",
        [productId, categoryId]
      );
    }
    this.logger.log("Seeded sample product (SKU=SKU-001)");
  }

  private async ensureDefaultCategories(): Promise<void> {
    const [countRows] = await this.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM categories"
    );
    const count = Number(countRows[0]?.count ?? 0);
    if (count > 0) return;

    const defaults = ["Electronics", "Apparel", "Books"];
    const placeholders = defaults.map(() => "(?)").join(", ");
    await this.execute(
      `INSERT INTO categories (name) VALUES ${placeholders}`,
      defaults
    );
    this.logger.log("Seeded default categories");
  }

  private async seedDefaultAttributes(): Promise<void> {
    // Check if attributes already exist
    const [attributeCountRows] = await this.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM attributes"
    );
    const attributeCount = Number(attributeCountRows[0]?.count ?? 0);

    if (attributeCount > 0) return; // Already seeded

    const now = new Date();

    // Create default attributes
    const defaultAttributes = [
      {
        code: "color",
        name: "Color",
        input_type: "select",
        data_type: "string",
      },
      { code: "size", name: "Size", input_type: "select", data_type: "string" },
      {
        code: "material",
        name: "Material",
        input_type: "select",
        data_type: "string",
      },
      { code: "brand", name: "Brand", input_type: "text", data_type: "string" },
      {
        code: "weight",
        name: "Weight",
        input_type: "number",
        data_type: "number",
        unit: "kg",
      },
      {
        code: "memory",
        name: "Memory",
        input_type: "select",
        data_type: "string",
      },
      {
        code: "storage",
        name: "Storage",
        input_type: "select",
        data_type: "string",
      },
      {
        code: "author",
        name: "Author",
        input_type: "text",
        data_type: "string",
      },
      {
        code: "pages",
        name: "Pages",
        input_type: "number",
        data_type: "number",
      },
    ];

    const attributeIds: { [key: string]: number } = {};

    for (const attr of defaultAttributes) {
      const [attrResult] = await this.execute<ResultSetHeader>(
        `INSERT INTO attributes (code, name, input_type, data_type, unit, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          attr.code,
          attr.name,
          attr.input_type,
          attr.data_type,
          attr.unit || null,
          now,
          now,
        ]
      );
      attributeIds[attr.code] = attrResult.insertId;
    }

    // Create default attribute values
    const defaultValues = [
      // Color values
      {
        attribute_code: "color",
        value_code: "red",
        label: "Red",
        sort_order: 1,
      },
      {
        attribute_code: "color",
        value_code: "blue",
        label: "Blue",
        sort_order: 2,
      },
      {
        attribute_code: "color",
        value_code: "green",
        label: "Green",
        sort_order: 3,
      },
      {
        attribute_code: "color",
        value_code: "black",
        label: "Black",
        sort_order: 4,
      },
      {
        attribute_code: "color",
        value_code: "white",
        label: "White",
        sort_order: 5,
      },

      // Size values
      { attribute_code: "size", value_code: "xs", label: "XS", sort_order: 1 },
      { attribute_code: "size", value_code: "s", label: "S", sort_order: 2 },
      { attribute_code: "size", value_code: "m", label: "M", sort_order: 3 },
      { attribute_code: "size", value_code: "l", label: "L", sort_order: 4 },
      { attribute_code: "size", value_code: "xl", label: "XL", sort_order: 5 },

      // Material values
      {
        attribute_code: "material",
        value_code: "cotton",
        label: "Cotton",
        sort_order: 1,
      },
      {
        attribute_code: "material",
        value_code: "polyester",
        label: "Polyester",
        sort_order: 2,
      },
      {
        attribute_code: "material",
        value_code: "wool",
        label: "Wool",
        sort_order: 3,
      },
      {
        attribute_code: "material",
        value_code: "leather",
        label: "Leather",
        sort_order: 4,
      },

      // Memory values
      {
        attribute_code: "memory",
        value_code: "8gb",
        label: "8GB",
        sort_order: 1,
      },
      {
        attribute_code: "memory",
        value_code: "16gb",
        label: "16GB",
        sort_order: 2,
      },
      {
        attribute_code: "memory",
        value_code: "32gb",
        label: "32GB",
        sort_order: 3,
      },
      {
        attribute_code: "memory",
        value_code: "64gb",
        label: "64GB",
        sort_order: 4,
      },

      // Storage values
      {
        attribute_code: "storage",
        value_code: "256gb",
        label: "256GB",
        sort_order: 1,
      },
      {
        attribute_code: "storage",
        value_code: "512gb",
        label: "512GB",
        sort_order: 2,
      },
      {
        attribute_code: "storage",
        value_code: "1tb",
        label: "1TB",
        sort_order: 3,
      },
      {
        attribute_code: "storage",
        value_code: "2tb",
        label: "2TB",
        sort_order: 4,
      },
    ];

    for (const value of defaultValues) {
      await this.execute(
        `INSERT INTO attribute_values (attribute_id, value_code, label, sort_order) 
         VALUES (?, ?, ?, ?)`,
        [
          attributeIds[value.attribute_code],
          value.value_code,
          value.label,
          value.sort_order,
        ]
      );
    }

    // Create default attribute sets
    const defaultSets = [
      { name: "Clothing", description: "Standard clothing attributes" },
      { name: "Electronics", description: "Standard electronics attributes" },
      { name: "Books", description: "Standard book attributes" },
    ];

    const setIds: { [key: string]: number } = {};

    for (const set of defaultSets) {
      const [setResult] = await this.execute<ResultSetHeader>(
        `INSERT INTO attribute_sets (name, description, is_system, sort_order, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [set.name, set.description, true, 0, now, now]
      );
      setIds[set.name] = setResult.insertId;
    }

    // Assign attributes to sets
    const setAssignments = [
      // Clothing set
      {
        set_name: "Clothing",
        attribute_code: "color",
        sort_order: 1,
        is_required: true,
      },
      {
        set_name: "Clothing",
        attribute_code: "size",
        sort_order: 2,
        is_required: true,
      },
      {
        set_name: "Clothing",
        attribute_code: "material",
        sort_order: 3,
        is_required: false,
      },
      {
        set_name: "Clothing",
        attribute_code: "brand",
        sort_order: 4,
        is_required: false,
      },

      // Electronics set
      {
        set_name: "Electronics",
        attribute_code: "brand",
        sort_order: 1,
        is_required: true,
      },
      {
        set_name: "Electronics",
        attribute_code: "memory",
        sort_order: 2,
        is_required: true,
      },
      {
        set_name: "Electronics",
        attribute_code: "storage",
        sort_order: 3,
        is_required: true,
      },
      {
        set_name: "Electronics",
        attribute_code: "weight",
        sort_order: 4,
        is_required: false,
      },

      // Books set
      {
        set_name: "Books",
        attribute_code: "author",
        sort_order: 1,
        is_required: true,
      },
      {
        set_name: "Books",
        attribute_code: "pages",
        sort_order: 2,
        is_required: false,
      },
    ];

    for (const assignment of setAssignments) {
      await this.execute(
        `INSERT INTO attribute_set_assignments (attribute_set_id, attribute_id, sort_order, is_required, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          setIds[assignment.set_name],
          attributeIds[assignment.attribute_code],
          assignment.sort_order,
          assignment.is_required,
          now,
          now,
        ]
      );
    }

    this.logger.log(
      "Seeded default attributes, attribute values, and attribute sets"
    );
  }

  private async insertPermissions(
    roleId: number,
    permissions: string[]
  ): Promise<void> {
    if (!permissions.length) return;
    const placeholders = permissions.map(() => "(?, ?)").join(", ");
    const params = permissions.flatMap((perm) => [roleId, perm]);
    await this.execute(
      `INSERT IGNORE INTO role_permissions (role_id, permission) VALUES ${placeholders}`,
      params
    );
  }

  async execute<
    T extends
      | RowDataPacket[]
      | RowDataPacket[][]
      | OkPacket
      | OkPacket[]
      | ResultSetHeader = RowDataPacket[]
  >(sql: string, params?: any): Promise<[T, FieldPacket[]]> {
    const pool = this.getPool();
    return pool.query<T>(sql, params);
  }

  private async ensureNormalizedSchema(): Promise<void> {
    try {
      // Check if attribute_value_id column exists
      const [existingColumn] = await this.execute(
        "SHOW COLUMNS FROM product_attribute_values LIKE 'attribute_value_id'"
      );

      if (!Array.isArray(existingColumn) || existingColumn.length === 0) {
        console.log(
          "Adding attribute_value_id column to product_attribute_values table..."
        );

        // Add the attribute_value_id column
        await this.execute(
          "ALTER TABLE product_attribute_values ADD COLUMN attribute_value_id BIGINT UNSIGNED NULL"
        );

        // Add foreign key constraint
        try {
          await this.execute(
            "ALTER TABLE product_attribute_values ADD CONSTRAINT fk_pav_attribute_value FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON DELETE CASCADE"
          );
        } catch (error) {
          console.log("Foreign key constraint might already exist:", error);
        }

        // Add performance indexes
        try {
          await this.execute(
            "ALTER TABLE product_attribute_values ADD KEY ix_pav_attribute_value (attribute_value_id)"
          );
        } catch (error) {
          console.log(
            "Index ix_pav_attribute_value might already exist:",
            error
          );
        }

        try {
          await this.execute(
            "ALTER TABLE product_attribute_values ADD KEY ix_product_attribute_value (product_id, attribute_id, attribute_value_id)"
          );
        } catch (error) {
          console.log(
            "Index ix_product_attribute_value might already exist:",
            error
          );
        }

        try {
          await this.execute(
            "ALTER TABLE product_attribute_values ADD KEY ix_attribute_value_product (attribute_value_id, product_id)"
          );
        } catch (error) {
          console.log(
            "Index ix_attribute_value_product might already exist:",
            error
          );
        }

        // Remove unique constraint to allow multiple values per product-attribute
        try {
          await this.execute(
            "ALTER TABLE product_attribute_values DROP INDEX ux_product_attribute"
          );
        } catch (error) {
          console.log("Unique constraint might not exist:", error);
        }

        console.log(
          "Successfully applied normalized schema to product_attribute_values table"
        );
      } else {
        console.log(
          "Normalized schema already exists in product_attribute_values table"
        );
      }
    } catch (error) {
      console.error("Error ensuring normalized schema:", error);
    }
  }

  private async seedDefaultTranslations(): Promise<void> {
    // Check if languages already exist
    const [languageCount] = await this.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM languages"
    );

    const languagesExist = Number(languageCount[0]?.count ?? 0) > 0;

    // Insert default languages only if they don't exist
    if (!languagesExist) {
      await this.execute(`
        INSERT INTO languages (code, name, nativeName, isDefault, isActive, flagIcon) VALUES
        ('en', 'English', 'English', true, true, '🇺🇸'),
        ('es', 'Spanish', 'Español', false, true, '🇪🇸'),
        ('fr', 'French', 'Français', false, true, '🇫🇷'),
        ('de', 'German', 'Deutsch', false, true, '🇩🇪'),
        ('it', 'Italian', 'Italiano', false, true, '🇮🇹')
      `);
    }

    // Insert default namespaces only if they don't exist
    const [namespaceCount] = await this.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM translation_namespaces"
    );

    if (Number(namespaceCount[0]?.count ?? 0) === 0) {
      await this.execute(`
        INSERT INTO translation_namespaces (name, description, isActive) VALUES
        ('common', 'Common UI elements and messages', true),
        ('auth', 'Authentication related messages', true),
        ('products', 'Product management messages', true),
        ('users', 'User management messages', true),
        ('categories', 'Category management messages', true),
        ('roles', 'Role management messages', true),
        ('attributes', 'Attribute management messages', true),
        ('storage', 'File storage messages', true),
        ('validation', 'Form validation messages', true),
        ('translations', 'Translation management messages', true)
      `);
    } else {
      // Ensure attributes namespace exists (for existing databases)
      const [attributesNamespace] = await this.execute<RowDataPacket[]>(
        "SELECT id FROM translation_namespaces WHERE name = 'attributes'"
      );
      if (attributesNamespace.length === 0) {
        await this.execute(`
          INSERT INTO translation_namespaces (name, description, isActive) VALUES
          ('attributes', 'Attribute management messages', true)
        `);
      }

      // Ensure translations namespace exists (for existing databases)
      const [translationsNamespace] = await this.execute<RowDataPacket[]>(
        "SELECT id FROM translation_namespaces WHERE name = 'translations'"
      );
      if (translationsNamespace.length === 0) {
        await this.execute(`
          INSERT INTO translation_namespaces (name, description, isActive) VALUES
          ('translations', 'Translation management messages', true)
        `);
      }
    }

    // Get language and namespace IDs (after ensuring all namespaces exist)
    const [languages] = await this.execute<RowDataPacket[]>(
      "SELECT id, code FROM languages"
    );
    const [namespaces] = await this.execute<RowDataPacket[]>(
      "SELECT id, name FROM translation_namespaces"
    );

    const languageMap = new Map(languages.map((l) => [l.code, l.id]));
    const namespaceMap = new Map(namespaces.map((n) => [n.name, n.id]));

    // Debug: Log available namespaces
    console.log("Available namespaces:", Array.from(namespaceMap.keys()));
    console.log("Attributes namespace ID:", namespaceMap.get("attributes"));

    // Insert translation keys
    const translationKeys = [
      // Common namespace
      { namespace: "common", key: "loading", description: "Loading message" },
      { namespace: "common", key: "save", description: "Save button text" },
      { namespace: "common", key: "cancel", description: "Cancel button text" },
      { namespace: "common", key: "delete", description: "Delete button text" },
      { namespace: "common", key: "edit", description: "Edit button text" },
      { namespace: "common", key: "create", description: "Create button text" },
      { namespace: "common", key: "search", description: "Search placeholder" },
      {
        namespace: "common",
        key: "no_results",
        description: "No results message",
      },
      {
        namespace: "common",
        key: "aurora_admin",
        description: "Aurora Admin brand text",
      },
      { namespace: "common", key: "logout", description: "Logout button text" },
      {
        namespace: "common",
        key: "system",
        description: "System navigation header",
      },
      {
        namespace: "common",
        key: "users",
        description: "Users navigation item",
      },
      {
        namespace: "common",
        key: "roles",
        description: "Roles navigation item",
      },
      {
        namespace: "common",
        key: "storage",
        description: "Storage navigation item",
      },
      {
        namespace: "common",
        key: "e_commerce",
        description: "E-Commerce navigation header",
      },
      {
        namespace: "common",
        key: "categories",
        description: "Categories navigation item",
      },
      {
        namespace: "common",
        key: "products",
        description: "Products navigation item",
      },
      {
        namespace: "common",
        key: "attributes",
        description: "Attributes navigation item",
      },
      {
        namespace: "common",
        key: "attribute_values",
        description: "Attribute Values navigation item",
      },
      {
        namespace: "common",
        key: "attribute_sets",
        description: "Attribute Sets navigation item",
      },
      {
        namespace: "common",
        key: "localization",
        description: "Localization navigation header",
      },
      {
        namespace: "common",
        key: "translations",
        description: "Translations navigation item",
      },

      // Auth namespace
      {
        namespace: "auth",
        key: "login.title",
        description: "Login page title",
      },
      {
        namespace: "auth",
        key: "login.email",
        description: "Email field label",
      },
      {
        namespace: "auth",
        key: "login.password",
        description: "Password field label",
      },
      {
        namespace: "auth",
        key: "login.submit",
        description: "Login button text",
      },
      {
        namespace: "auth",
        key: "login.invalid_credentials",
        description: "Invalid credentials error",
      },

      // Products namespace
      {
        namespace: "products",
        key: "title",
        description: "Products page title",
      },
      {
        namespace: "products",
        key: "subtitle",
        description: "Products page subtitle",
      },
      {
        namespace: "products",
        key: "search_placeholder",
        description: "Search placeholder",
      },
      {
        namespace: "products",
        key: "add_product",
        description: "Add product button",
      },
      {
        namespace: "products",
        key: "not_allowed",
        description: "Not allowed message",
      },
      {
        namespace: "products",
        key: "loading_title",
        description: "Loading title",
      },
      {
        namespace: "products",
        key: "loading_description",
        description: "Loading description",
      },
      {
        namespace: "products",
        key: "total_products",
        description: "Total products stat",
      },
      {
        namespace: "products",
        key: "active_products",
        description: "Active products stat",
      },
      {
        namespace: "products",
        key: "with_variants",
        description: "With variants stat",
      },
      {
        namespace: "products",
        key: "with_attributes",
        description: "With attributes stat",
      },
      {
        namespace: "products",
        key: "product_management",
        description: "Product management title",
      },
      {
        namespace: "products",
        key: "product_management_description",
        description: "Product management description",
      },
      {
        namespace: "products",
        key: "showing_results_for",
        description: "Showing results message",
      },
      {
        namespace: "products",
        key: "no_products_found",
        description: "No products found message",
      },
      {
        namespace: "products",
        key: "no_products_yet",
        description: "No products yet message",
      },
      {
        namespace: "products",
        key: "no_products_match_search",
        description: "No products match search message",
      },
      {
        namespace: "products",
        key: "get_started_add_product",
        description: "Get started message",
      },
      {
        namespace: "products",
        key: "add_first_product",
        description: "Add first product button",
      },
      {
        namespace: "products",
        key: "failed_to_load_products",
        description: "Failed to load products message",
      },
      {
        namespace: "products",
        key: "unexpected_error_loading_products",
        description: "Unexpected error message",
      },
      {
        namespace: "products",
        key: "try_again",
        description: "Try again button",
      },
      {
        namespace: "products",
        key: "edit_product",
        description: "Edit product button",
      },
      {
        namespace: "products",
        key: "delete_product",
        description: "Delete product button",
      },
      {
        namespace: "products",
        key: "confirm_delete_product",
        description: "Confirm delete message",
      },
      {
        namespace: "products",
        key: "create.title",
        description: "Create product title",
      },
      {
        namespace: "products",
        key: "edit.title",
        description: "Edit product title",
      },
      { namespace: "products", key: "name", description: "Product name field" },
      {
        namespace: "products",
        key: "description",
        description: "Product description field",
      },
      {
        namespace: "products",
        key: "price",
        description: "Product price field",
      },
      { namespace: "products", key: "sku", description: "Product SKU field" },
      {
        namespace: "products",
        key: "product_name",
        description: "Product Name column header",
      },
      { namespace: "products", key: "type", description: "Type column header" },
      {
        namespace: "products",
        key: "categories",
        description: "Categories column header",
      },
      {
        namespace: "products",
        key: "variant_count",
        description: "Variant count text",
      },
      { namespace: "products", key: "more", description: "More text" },
      {
        namespace: "products",
        key: "no_categories",
        description: "No categories text",
      },
      {
        namespace: "products",
        key: "get_started_products",
        description: "Get started with products message",
      },

      // Users namespace
      { namespace: "users", key: "title", description: "Users page title" },
      {
        namespace: "users",
        key: "subtitle",
        description: "Users page subtitle",
      },
      {
        namespace: "users",
        key: "search_placeholder",
        description: "Search placeholder",
      },
      {
        namespace: "users",
        key: "refresh_roles",
        description: "Refresh roles button",
      },
      {
        namespace: "users",
        key: "refresh_roles_tooltip",
        description: "Refresh roles tooltip",
      },
      { namespace: "users", key: "add_user", description: "Add user button" },
      {
        namespace: "users",
        key: "not_allowed",
        description: "Not allowed message",
      },
      {
        namespace: "users",
        key: "loading_title",
        description: "Loading title",
      },
      {
        namespace: "users",
        key: "loading_description",
        description: "Loading description",
      },
      {
        namespace: "users",
        key: "total_users",
        description: "Total users stat",
      },
      {
        namespace: "users",
        key: "active_users",
        description: "Active users stat",
      },
      {
        namespace: "users",
        key: "administrators",
        description: "Administrators stat",
      },
      {
        namespace: "users",
        key: "with_profiles",
        description: "With profiles stat",
      },
      {
        namespace: "users",
        key: "user_management",
        description: "User management title",
      },
      {
        namespace: "users",
        key: "user_management_description",
        description: "User management description",
      },
      {
        namespace: "users",
        key: "showing_results_for",
        description: "Showing results message",
      },
      {
        namespace: "users",
        key: "no_users_found",
        description: "No users found message",
      },
      {
        namespace: "users",
        key: "no_users_yet",
        description: "No users yet message",
      },
      {
        namespace: "users",
        key: "no_users_match_search",
        description: "No users match search message",
      },
      {
        namespace: "users",
        key: "get_started_add_user",
        description: "Get started message",
      },
      {
        namespace: "users",
        key: "add_first_user",
        description: "Add first user button",
      },
      {
        namespace: "users",
        key: "failed_to_load_users",
        description: "Failed to load users message",
      },
      {
        namespace: "users",
        key: "unexpected_error_loading_users",
        description: "Unexpected error message",
      },
      { namespace: "users", key: "try_again", description: "Try again button" },
      { namespace: "users", key: "edit_user", description: "Edit user button" },
      {
        namespace: "users",
        key: "delete_user",
        description: "Delete user button",
      },
      {
        namespace: "users",
        key: "confirm_delete_user",
        description: "Confirm delete message",
      },
      {
        namespace: "users",
        key: "create.title",
        description: "Create user title",
      },
      { namespace: "users", key: "edit.title", description: "Edit user title" },
      {
        namespace: "users",
        key: "first_name",
        description: "First name field",
      },
      { namespace: "users", key: "last_name", description: "Last name field" },
      { namespace: "users", key: "email", description: "Email field" },
      {
        namespace: "users",
        key: "required_fields_note",
        description: "Required fields note",
      },
      {
        namespace: "users",
        key: "enter_first_name",
        description: "Enter first name placeholder",
      },
      {
        namespace: "users",
        key: "enter_last_name",
        description: "Enter last name placeholder",
      },
      {
        namespace: "users",
        key: "enter_email",
        description: "Enter email placeholder",
      },
      {
        namespace: "users",
        key: "basic_information",
        description: "Basic information section",
      },
      {
        namespace: "users",
        key: "date_of_birth",
        description: "Date of birth field",
      },
      {
        namespace: "users",
        key: "profile_picture",
        description: "Profile picture section",
      },
      { namespace: "users", key: "no_image", description: "No image message" },
      {
        namespace: "users",
        key: "choose_image",
        description: "Choose image button",
      },
      { namespace: "users", key: "remove", description: "Remove button" },
      {
        namespace: "users",
        key: "uploading",
        description: "Uploading message",
      },
      {
        namespace: "users",
        key: "roles_permissions",
        description: "Roles permissions section",
      },
      {
        namespace: "users",
        key: "assign_roles",
        description: "Assign roles field",
      },
      {
        namespace: "users",
        key: "loading_roles",
        description: "Loading roles message",
      },
      {
        namespace: "users",
        key: "no_roles_available",
        description: "No roles available message",
      },
      {
        namespace: "users",
        key: "hold_ctrl_select_multiple",
        description: "Hold ctrl select multiple message",
      },
      {
        namespace: "users",
        key: "change_password",
        description: "Change password section",
      },
      {
        namespace: "users",
        key: "new_password",
        description: "New password field",
      },
      {
        namespace: "users",
        key: "leave_blank_keep_current",
        description: "Leave blank keep current message",
      },
      {
        namespace: "users",
        key: "re_enter_password",
        description: "Re-enter password field",
      },
      { namespace: "users", key: "cancel", description: "Cancel button" },
      {
        namespace: "users",
        key: "update_user",
        description: "Update user button",
      },
      {
        namespace: "users",
        key: "create_user",
        description: "Create user button",
      },
      { namespace: "users", key: "updating", description: "Updating message" },
      { namespace: "users", key: "creating", description: "Creating message" },
      {
        namespace: "users",
        key: "user_permissions_controlled_by_roles",
        description: "User permissions controlled by roles message",
      },
      {
        namespace: "users",
        key: "avatar",
        description: "Avatar column header",
      },
      { namespace: "users", key: "admin", description: "Admin badge text" },
      {
        namespace: "users",
        key: "profile_complete",
        description: "Profile Complete status",
      },
      {
        namespace: "users",
        key: "basic_info_only",
        description: "Basic Info Only status",
      },
      {
        namespace: "users",
        key: "more",
        description: "More text for additional items",
      },
      { namespace: "users", key: "no_roles", description: "No roles message" },
      { namespace: "users", key: "active", description: "Active status" },
      { namespace: "users", key: "inactive", description: "Inactive status" },
      {
        namespace: "users",
        key: "edit_user_information",
        description: "Edit user information tooltip",
      },
      {
        namespace: "users",
        key: "delete_user",
        description: "Delete user tooltip",
      },

      // Categories namespace
      {
        namespace: "categories",
        key: "product_categories",
        description: "Product Categories page title",
      },
      {
        namespace: "categories",
        key: "page_subtitle",
        description: "Categories page subtitle",
      },
      {
        namespace: "categories",
        key: "search_placeholder",
        description: "Search categories placeholder",
      },
      {
        namespace: "categories",
        key: "not_allowed",
        description: "Not allowed tooltip",
      },
      {
        namespace: "categories",
        key: "add_new_category",
        description: "Add New Category button",
      },
      {
        namespace: "categories",
        key: "access_denied",
        description: "Access denied error title",
      },
      {
        namespace: "categories",
        key: "no_permission_view_categories",
        description: "No permission to view categories message",
      },
      {
        namespace: "categories",
        key: "loading_categories",
        description: "Loading categories title",
      },
      {
        namespace: "categories",
        key: "loading_categories_description",
        description: "Loading categories description",
      },
      {
        namespace: "categories",
        key: "failed_to_load_categories",
        description: "Failed to load categories error title",
      },
      {
        namespace: "categories",
        key: "unexpected_error_loading_categories",
        description: "Unexpected error loading categories message",
      },
      {
        namespace: "categories",
        key: "try_again",
        description: "Try again button",
      },
      {
        namespace: "categories",
        key: "total_categories",
        description: "Total categories stat label",
      },
      {
        namespace: "categories",
        key: "root_categories",
        description: "Root categories stat label",
      },
      {
        namespace: "categories",
        key: "subcategories",
        description: "Subcategories stat label",
      },
      {
        namespace: "categories",
        key: "max_depth",
        description: "Max depth stat label",
      },
      {
        namespace: "categories",
        key: "category_management",
        description: "Category Management section title",
      },
      {
        namespace: "categories",
        key: "manage_categories_description",
        description: "Manage categories description",
      },
      {
        namespace: "categories",
        key: "showing_results_for",
        description: "Showing results for text",
      },
      {
        namespace: "categories",
        key: "edit_category",
        description: "Edit Category modal title",
      },
      {
        namespace: "categories",
        key: "add_category",
        description: "Add Category modal title",
      },
      {
        namespace: "categories",
        key: "delete_category",
        description: "Delete Category confirmation title",
      },
      {
        namespace: "categories",
        key: "confirm_delete_category",
        description: "Confirm delete category message",
      },
      {
        namespace: "categories",
        key: "this_category",
        description: "This category text",
      },
      { namespace: "categories", key: "delete", description: "Delete button" },
      { namespace: "categories", key: "cancel", description: "Cancel button" },
      {
        namespace: "categories",
        key: "category_name",
        description: "Category Name column header",
      },
      {
        namespace: "categories",
        key: "parent_category",
        description: "Parent Category column header",
      },
      {
        namespace: "categories",
        key: "hierarchy",
        description: "Hierarchy column header",
      },
      { namespace: "categories", key: "root", description: "Root badge text" },
      {
        namespace: "categories",
        key: "top_level_category",
        description: "Top-level category text",
      },
      {
        namespace: "categories",
        key: "subcategory_level",
        description: "Subcategory level text",
      },
      {
        namespace: "categories",
        key: "no_parent",
        description: "No parent text",
      },
      { namespace: "categories", key: "level", description: "Level text" },
      {
        namespace: "categories",
        key: "edit_category",
        description: "Edit category tooltip",
      },
      {
        namespace: "categories",
        key: "id",
        description: "ID column header",
      },
      {
        namespace: "categories",
        key: "actions",
        description: "Actions column header",
      },
      {
        namespace: "categories",
        key: "edit",
        description: "Edit button text",
      },
      {
        namespace: "categories",
        key: "delete_category",
        description: "Delete category tooltip",
      },
      {
        namespace: "categories",
        key: "no_categories_found",
        description: "No categories found message",
      },
      {
        namespace: "categories",
        key: "get_started_categories",
        description: "Get started with categories message",
      },
      {
        namespace: "categories",
        key: "category_management_description",
        description: "Category management modal description",
      },
      {
        namespace: "categories",
        key: "category_information",
        description: "Category Information section title",
      },
      {
        namespace: "categories",
        key: "category_name",
        description: "Category Name field label",
      },
      {
        namespace: "categories",
        key: "enter_category_name",
        description: "Enter category name placeholder",
      },
      {
        namespace: "categories",
        key: "category_name_help",
        description: "Category name help text",
      },
      {
        namespace: "categories",
        key: "category_hierarchy",
        description: "Category Hierarchy section title",
      },
      {
        namespace: "categories",
        key: "parent_category",
        description: "Parent Category field label",
      },
      {
        namespace: "categories",
        key: "parent_category_help",
        description: "Parent category help text",
      },
      {
        namespace: "categories",
        key: "saving",
        description: "Saving button text",
      },
      {
        namespace: "categories",
        key: "updating",
        description: "Updating button text",
      },
      {
        namespace: "categories",
        key: "creating",
        description: "Creating button text",
      },
      {
        namespace: "categories",
        key: "update_category",
        description: "Update Category button",
      },
      {
        namespace: "categories",
        key: "create_category",
        description: "Create Category button",
      },

      // Roles namespace
      {
        namespace: "roles",
        key: "roles_permissions",
        description: "Roles & Permissions page title",
      },
      {
        namespace: "roles",
        key: "page_subtitle",
        description: "Roles page subtitle",
      },
      {
        namespace: "roles",
        key: "not_allowed",
        description: "Not allowed tooltip",
      },
      {
        namespace: "roles",
        key: "add_new_role",
        description: "Add New Role button",
      },
      {
        namespace: "roles",
        key: "no_permission_view_roles",
        description: "No permission to view roles message",
      },
      {
        namespace: "roles",
        key: "loading_roles",
        description: "Loading roles title",
      },
      {
        namespace: "roles",
        key: "loading_roles_description",
        description: "Loading roles description",
      },
      {
        namespace: "roles",
        key: "total_roles",
        description: "Total roles stat label",
      },
      {
        namespace: "roles",
        key: "total_permissions",
        description: "Total permissions stat label",
      },
      {
        namespace: "roles",
        key: "system_roles",
        description: "System roles stat label",
      },
      {
        namespace: "roles",
        key: "custom_roles",
        description: "Custom roles stat label",
      },
      {
        namespace: "roles",
        key: "role_management",
        description: "Role Management section title",
      },
      {
        namespace: "roles",
        key: "role_management_description",
        description: "Role management description",
      },
      {
        namespace: "roles",
        key: "failed_to_load_roles",
        description: "Failed to load roles error title",
      },
      {
        namespace: "roles",
        key: "unexpected_error_loading_roles",
        description: "Unexpected error loading roles message",
      },
      { namespace: "roles", key: "try_again", description: "Try again button" },
      {
        namespace: "roles",
        key: "edit_role",
        description: "Edit Role modal title",
      },
      {
        namespace: "roles",
        key: "add_role",
        description: "Add Role modal title",
      },
      {
        namespace: "roles",
        key: "delete_role",
        description: "Delete Role confirmation title",
      },
      {
        namespace: "roles",
        key: "confirm_delete_role",
        description: "Confirm delete role message",
      },
      { namespace: "roles", key: "this_role", description: "This role text" },
      { namespace: "roles", key: "delete", description: "Delete button" },
      { namespace: "roles", key: "cancel", description: "Cancel button" },
      {
        namespace: "roles",
        key: "role_name",
        description: "Role Name column header",
      },
      {
        namespace: "roles",
        key: "permission_count",
        description: "Permission count text",
      },
      {
        namespace: "roles",
        key: "more_permissions",
        description: "More permissions text",
      },
      {
        namespace: "roles",
        key: "no_permissions_assigned",
        description: "No permissions assigned message",
      },
      {
        namespace: "roles",
        key: "edit_role_permissions",
        description: "Edit role permissions tooltip",
      },
      {
        namespace: "roles",
        key: "delete_role",
        description: "Delete role tooltip",
      },
      {
        namespace: "roles",
        key: "system_roles_cannot_be_deleted",
        description: "System roles cannot be deleted tooltip",
      },
      {
        namespace: "roles",
        key: "no_roles_found",
        description: "No roles found message",
      },
      {
        namespace: "roles",
        key: "get_started_roles",
        description: "Get started with roles message",
      },

      // Attributes namespace
      {
        namespace: "attributes",
        key: "attributes",
        description: "Attributes page title",
      },
      {
        namespace: "attributes",
        key: "page_subtitle",
        description: "Attributes page subtitle",
      },
      {
        namespace: "attributes",
        key: "not_allowed",
        description: "Not allowed tooltip",
      },
      {
        namespace: "attributes",
        key: "add_attribute",
        description: "Add Attribute button",
      },
      { namespace: "attributes", key: "loading", description: "Loading text" },
      {
        namespace: "attributes",
        key: "failed_to_load_attributes",
        description: "Failed to load attributes error message",
      },
      { namespace: "attributes", key: "id", description: "ID column header" },
      {
        namespace: "attributes",
        key: "code",
        description: "Code column header",
      },
      {
        namespace: "attributes",
        key: "name",
        description: "Name column header",
      },
      {
        namespace: "attributes",
        key: "input_type",
        description: "Input Type column header",
      },
      {
        namespace: "attributes",
        key: "data_type",
        description: "Data Type column header",
      },
      {
        namespace: "attributes",
        key: "unit",
        description: "Unit column header",
      },
      {
        namespace: "attributes",
        key: "created",
        description: "Created column header",
      },
      {
        namespace: "attributes",
        key: "actions",
        description: "Actions column header",
      },
      {
        namespace: "attributes",
        key: "no_attributes_found",
        description: "No attributes found message",
      },
      {
        namespace: "attributes",
        key: "create_first_attribute",
        description: "Create first attribute message",
      },
      {
        namespace: "attributes",
        key: "delete_attribute",
        description: "Delete Attribute confirmation title",
      },
      {
        namespace: "attributes",
        key: "confirm_delete_attribute",
        description: "Confirm delete attribute message",
      },
      {
        namespace: "attributes",
        key: "action_cannot_be_undone",
        description: "Action cannot be undone message",
      },
      {
        namespace: "attributes",
        key: "input_type_select",
        description: "Select input type label",
      },
      {
        namespace: "attributes",
        key: "input_type_multiselect",
        description: "Multi-select input type label",
      },
      {
        namespace: "attributes",
        key: "input_type_text",
        description: "Text input type label",
      },
      {
        namespace: "attributes",
        key: "input_type_number",
        description: "Number input type label",
      },
      {
        namespace: "attributes",
        key: "input_type_boolean",
        description: "Boolean input type label",
      },
      {
        namespace: "attributes",
        key: "data_type_string",
        description: "String data type label",
      },
      {
        namespace: "attributes",
        key: "data_type_number",
        description: "Number data type label",
      },
      {
        namespace: "attributes",
        key: "data_type_boolean",
        description: "Boolean data type label",
      },
      {
        namespace: "attributes",
        key: "total_attributes",
        description: "Total attributes stat label",
      },
      {
        namespace: "attributes",
        key: "select_attributes",
        description: "Select attributes stat label",
      },
      {
        namespace: "attributes",
        key: "input_attributes",
        description: "Input attributes stat label",
      },
      {
        namespace: "attributes",
        key: "with_units",
        description: "With units stat label",
      },
      {
        namespace: "attributes",
        key: "attribute_management",
        description: "Attribute Management section title",
      },
      {
        namespace: "attributes",
        key: "attribute_management_description",
        description: "Attribute Management description",
      },
      {
        namespace: "attributes",
        key: "edit_attribute",
        description: "Edit Attribute button",
      },
      {
        namespace: "attributes",
        key: "edit",
        description: "Edit button text",
      },
      {
        namespace: "attributes",
        key: "delete",
        description: "Delete button text",
      },
      {
        namespace: "attributes",
        key: "add_new_attribute",
        description: "Add New Attribute button",
      },
      {
        namespace: "attributes",
        key: "required_fields_note",
        description: "Required fields note",
      },
      {
        namespace: "attributes",
        key: "code_placeholder",
        description: "Code placeholder text",
      },
      {
        namespace: "attributes",
        key: "code_help_text",
        description: "Code help text",
      },
      {
        namespace: "attributes",
        key: "name_placeholder",
        description: "Name placeholder text",
      },
      {
        namespace: "attributes",
        key: "select_single_choice",
        description: "Select single choice option",
      },
      {
        namespace: "attributes",
        key: "multiselect_multiple_choices",
        description: "Multiselect multiple choices option",
      },
      {
        namespace: "attributes",
        key: "text_input",
        description: "Text input option",
      },
      {
        namespace: "attributes",
        key: "number_input",
        description: "Number input option",
      },
      {
        namespace: "attributes",
        key: "boolean_yes_no",
        description: "Boolean yes/no option",
      },
      {
        namespace: "attributes",
        key: "string",
        description: "String data type option",
      },
      {
        namespace: "attributes",
        key: "number",
        description: "Number data type option",
      },
      {
        namespace: "attributes",
        key: "boolean",
        description: "Boolean data type option",
      },
      {
        namespace: "attributes",
        key: "unit_placeholder",
        description: "Unit placeholder text",
      },
      {
        namespace: "attributes",
        key: "unit_help_text",
        description: "Unit help text",
      },
      {
        namespace: "attributes",
        key: "create_new_attribute",
        description: "Create new attribute button",
      },
      {
        namespace: "attributes",
        key: "cancel",
        description: "Cancel button text",
      },
      {
        namespace: "attributes",
        key: "create_attribute",
        description: "Create attribute button",
      },

      // Validation namespace
      {
        namespace: "validation",
        key: "required",
        description: "Required field error",
      },
      {
        namespace: "validation",
        key: "email_invalid",
        description: "Invalid email error",
      },
      {
        namespace: "validation",
        key: "min_length",
        description: "Minimum length error",
      },
      {
        namespace: "validation",
        key: "max_length",
        description: "Maximum length error",
      },

      // Translations namespace
      {
        namespace: "translations",
        key: "title",
        description: "Translation management page title",
      },
      {
        namespace: "translations",
        key: "languages.title",
        description: "Languages tab title",
      },
      {
        namespace: "translations",
        key: "translations.title",
        description: "Translations tab title",
      },
      {
        namespace: "translations",
        key: "cache.title",
        description: "Cache management tab title",
      },
      {
        namespace: "translations",
        key: "add_language",
        description: "Add language button text",
      },
      {
        namespace: "translations",
        key: "edit_language",
        description: "Edit language button text",
      },
      {
        namespace: "translations",
        key: "delete_language",
        description: "Delete language button text",
      },
      {
        namespace: "translations",
        key: "clear_cache",
        description: "Clear cache button text",
      },
      {
        namespace: "translations",
        key: "warm_up_cache",
        description: "Warm up cache button text",
      },
    ];

    // Insert translation keys (skip if already exist)
    for (const keyData of translationKeys) {
      const namespaceId = namespaceMap.get(keyData.namespace);
      if (namespaceId) {
        // Check if this specific key already exists
        const [existingKey] = await this.execute<RowDataPacket[]>(
          "SELECT id FROM translation_keys WHERE key_path = ? AND namespaceId = ?",
          [keyData.key, namespaceId]
        );

        if (existingKey.length === 0) {
          await this.execute(
            `
            INSERT INTO translation_keys (key_path, description, isActive, namespaceId) 
            VALUES (?, ?, true, ?)
          `,
            [keyData.key, keyData.description, namespaceId]
          );
        }
      } else {
        console.error(
          `Namespace not found for key: ${keyData.namespace}.${keyData.key}`
        );
      }
    }

    // Insert translations for English (default language)
    const englishId = languageMap.get("en");
    if (englishId) {
      const [keys] = await this.execute<RowDataPacket[]>(
        "SELECT id, key_path FROM translation_keys"
      );

      const englishTranslations = {
        // Common translations
        loading: "Loading...",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        create: "Create",
        search: "Search...",
        no_results: "No results found",
        aurora_admin: "Aurora Admin",
        logout: "Logout",
        system: "System",
        users: "Users",
        roles: "Roles",
        storage: "Storage",
        e_commerce: "E-Commerce",
        categories: "Categories",
        products: "Products",
        attributes: "Attributes",
        attribute_values: "Attribute Values",
        attribute_sets: "Attribute Sets",
        localization: "Localization",
        translations: "Translations",

        // Auth translations
        "login.title": "Sign In",
        "login.email": "Email",
        "login.password": "Password",
        "login.submit": "Sign In",
        "login.invalid_credentials": "Invalid email or password",

        // Products translations
        "products.title": "Product Catalog",
        "products.subtitle":
          "Keep your catalog up to date and aligned with inventory. Manage products, pricing, and categories to drive sales.",
        "products.search_placeholder": "Search products by name or SKU...",
        "products.refresh_categories": "Refresh Categories",
        "products.refresh_categories_tooltip": "Refresh categories",
        "products.refreshing": "Refreshing…",
        "products.add_product": "Add New Product",
        "products.not_allowed": "Not allowed",
        "products.loading_title": "Loading Products",
        "products.loading_description":
          "Please wait while we fetch your product catalog...",
        "products.total_products": "Total Products",
        "products.published": "Published",
        "products.variable_products": "Variable Products",
        "products.total_value": "Total Value",
        "products.product_management": "Product Management",
        "products.product_management_description":
          "Manage your product catalog, pricing, and inventory.",
        "products.showing_results_for": "Showing results for",
        "products.failed_to_load_products": "Failed to Load Products",
        "products.unexpected_error_loading_products":
          "An unexpected error occurred while loading products.",
        "products.try_again": "Try Again",
        "products.edit_product": "Edit Product",
        "products.delete_product": "Delete Product",
        "products.confirm_delete_product":
          "Are you sure you want to delete this product?",
        "products.create.title": "Create Product",
        "products.edit.title": "Edit Product",
        "products.name": "Product Name",
        "products.description": "Description",
        "products.price": "Price",
        "products.sku": "SKU",
        "products.product_name": "Product Name",
        "products.type": "Type",
        "products.categories": "Categories",
        "products.variant_count": "{{count}} variant",
        "products.more": "more",
        "products.no_categories": "No categories",
        "products.get_started_products":
          "Get started by adding your first product to build your catalog.",

        // Users translations
        "users.title": "Users & Members",
        "users.subtitle":
          "Manage workspace members, permissions, and access. Add new users and assign roles to control what they can do.",
        "users.search_placeholder": "Search users by name or email...",
        "users.refresh_roles": "Refresh Roles",
        "users.refresh_roles_tooltip": "Refresh role options",
        "users.add_user": "Add New User",
        "users.not_allowed": "Not allowed",
        "users.loading_title": "Loading Users",
        "users.loading_description":
          "Please wait while we fetch the user information...",
        "users.total_users": "Total Users",
        "users.active_users": "Active Users",
        "users.administrators": "Administrators",
        "users.with_profiles": "With Profiles",
        "users.user_management": "User Management",
        "users.user_management_description":
          "Manage existing users, their roles, and permissions.",
        "users.showing_results_for": "Showing results for",
        "users.no_users_found": "No Users Found",
        "users.no_users_yet": "No Users Yet",
        "users.no_users_match_search":
          "No users match your search. Try adjusting your search terms.",
        "users.get_started_add_user":
          "Get started by adding your first user to the workspace.",
        "users.add_first_user": "Add First User",
        "users.failed_to_load_users": "Failed to Load Users",
        "users.unexpected_error_loading_users":
          "An unexpected error occurred while loading users.",
        "users.try_again": "Try Again",
        "users.edit_user": "Edit User",
        "users.delete_user": "Delete User",
        "users.confirm_delete_user":
          "Are you sure you want to delete this user?",
        "users.create.title": "Create User",
        "users.edit.title": "Edit User",
        "users.first_name": "First Name",
        "users.last_name": "Last Name",
        "users.email": "Email",
        "users.user_management": "User Management",
        "users.required_fields_note": "All fields marked with * are required.",
        "users.enter_first_name": "Enter first name",
        "users.enter_last_name": "Enter last name",
        "users.enter_email": "Enter email address",
        "users.basic_information": "Basic Information",
        "users.date_of_birth": "Date of Birth",
        "users.profile_picture": "Profile Picture",
        "users.no_image": "No Image",
        "users.choose_image": "Choose Image",
        "users.remove": "Remove",
        "users.uploading": "Uploading...",
        "users.roles_permissions": "Roles & Permissions",
        "users.assign_roles": "Assign Roles",
        "users.loading_roles": "Loading roles...",
        "users.no_roles_available":
          "No roles available or not authorized to view roles.",
        "users.hold_ctrl_select_multiple":
          "Hold Ctrl/Cmd to select multiple roles",
        "users.change_password": "Change Password",
        "users.new_password": "New Password",
        "users.leave_blank_keep_current":
          "Leave blank to keep current password",
        "users.re_enter_password": "Re-enter new password",
        "users.cancel": "Cancel",
        "users.update_user": "Update User",
        "users.create_user": "Create User",
        "users.updating": "Updating...",
        "users.creating": "Creating...",
        "users.user_permissions_controlled_by_roles":
          "User permissions are controlled by assigned roles",
        "users.avatar": "Avatar",
        "users.admin": "Admin",
        "users.profile_complete": "Profile Complete",
        "users.basic_info_only": "Basic Info Only",
        "users.more": "more",
        "users.no_roles": "No roles",
        "users.active": "Active",
        "users.inactive": "Inactive",
        "users.edit_user_information": "Edit user information",
        "users.delete_user": "Delete user",

        // Categories translations
        "categories.product_categories": "Product Categories",
        "categories.page_subtitle":
          "Organize products into clear, navigable groups. Create hierarchical categories to improve product discovery and management.",
        "categories.search_placeholder": "Search categories by name...",
        "categories.not_allowed": "Not allowed",
        "categories.add_new_category": "Add New Category",
        "categories.access_denied": "Access Denied",
        "categories.no_permission_view_categories":
          "You do not have permission to view categories.",
        "categories.loading_categories": "Loading Categories",
        "categories.loading_categories_description":
          "Please wait while we fetch your category information...",
        "categories.failed_to_load_categories": "Failed to Load Categories",
        "categories.unexpected_error_loading_categories":
          "An unexpected error occurred while loading categories.",
        "categories.try_again": "Try Again",
        "categories.total_categories": "Total Categories",
        "categories.root_categories": "Root Categories",
        "categories.subcategories": "Subcategories",
        "categories.max_depth": "Max Depth",
        "categories.category_management": "Category Management",
        "categories.manage_categories_description":
          "Manage your product categories and their hierarchy.",
        "categories.showing_results_for": "Showing results for",
        "categories.edit_category": "Edit Category",
        "categories.add_category": "Add Category",
        "categories.delete_category": "Delete Category",
        "categories.confirm_delete_category": "Are you sure you want to delete",
        "categories.this_category": "this category",
        "categories.delete": "Delete",
        "categories.cancel": "Cancel",
        "categories.id": "ID",
        "categories.actions": "Actions",
        "categories.edit": "Edit",
        "categories.category_name": "Category Name",
        "categories.parent_category": "Parent Category",
        "categories.hierarchy": "Hierarchy",
        "categories.root": "Root",
        "categories.top_level_category": "Top-level category",
        "categories.subcategory_level": "Subcategory (Level {{depth}})",
        "categories.no_parent": "No parent",
        "categories.level": "Level",
        "categories.edit_category": "Edit category",
        "categories.delete_category": "Delete category",
        "categories.no_categories_found": "No Categories Found",
        "categories.get_started_categories":
          "Get started by creating your first product category to organize your inventory.",
        "categories.category_management_description":
          "Create or edit product categories to organize your inventory. Categories help customers find products more easily.",
        "categories.category_information": "Category Information",
        "categories.category_name": "Category Name",
        "categories.enter_category_name":
          "Enter category name (e.g., Electronics, Clothing)",
        "categories.category_name_help":
          "Choose a clear, descriptive name that helps customers find products.",
        "categories.category_hierarchy": "Category Hierarchy",
        "categories.parent_category": "Parent Category",
        "categories.parent_category_help":
          "Leave empty to create a root category, or select a parent to create a subcategory.",
        "categories.saving": "Saving...",
        "categories.updating": "Updating...",
        "categories.creating": "Creating...",
        "categories.update_category": "Update Category",
        "categories.create_category": "Create Category",

        // Roles translations
        "roles.roles_permissions": "Roles & Permissions",
        "roles.page_subtitle":
          "Define permission sets and control what teams can access. Create custom roles to match your organization's needs.",
        "roles.not_allowed": "Not allowed",
        "roles.add_new_role": "Add New Role",
        "roles.no_permission_view_roles":
          "You do not have permission to view roles.",
        "roles.loading_roles": "Loading Roles",
        "roles.loading_roles_description":
          "Please wait while we fetch the role information...",
        "roles.total_roles": "Total Roles",
        "roles.total_permissions": "Total Permissions",
        "roles.system_roles": "System Roles",
        "roles.custom_roles": "Custom Roles",
        "roles.role_management": "Role Management",
        "roles.role_management_description":
          "Manage existing roles and their permissions. System roles cannot be deleted.",
        "roles.failed_to_load_roles": "Failed to Load Roles",
        "roles.unexpected_error_loading_roles":
          "An unexpected error occurred while loading roles.",
        "roles.try_again": "Try Again",
        "roles.edit_role": "Edit Role",
        "roles.add_role": "Add Role",
        "roles.delete_role": "Delete Role",
        "roles.confirm_delete_role": "Are you sure you want to delete",
        "roles.this_role": "this role",
        "roles.delete": "Delete",
        "roles.cancel": "Cancel",
        "roles.role_name": "Role Name",
        "roles.permission_count": "{{count}} permission",
        "roles.more_permissions": "more permission",
        "roles.no_permissions_assigned": "No permissions assigned",
        "roles.edit_role_permissions": "Edit role permissions",
        "roles.delete_role": "Delete role",
        "roles.system_roles_cannot_be_deleted":
          "System roles cannot be deleted",
        "roles.no_roles_found": "No Roles Found",
        "roles.get_started_roles":
          "Get started by creating your first role to define user permissions.",

        // Attributes translations
        "attributes.attributes": "Attributes",
        "attributes.page_subtitle":
          "Manage product attributes and their properties.",
        "attributes.not_allowed": "Not allowed",
        "attributes.add_attribute": "Add Attribute",
        "attributes.loading": "Loading...",
        "attributes.failed_to_load_attributes": "Failed to load attributes",
        "attributes.id": "ID",
        "attributes.code": "Code",
        "attributes.name": "Name",
        "attributes.input_type": "Input Type",
        "attributes.data_type": "Data Type",
        "attributes.unit": "Unit",
        "attributes.created": "Created",
        "attributes.actions": "Actions",
        "attributes.no_attributes_found": "No attributes found",
        "attributes.attribute_sets": "Attribute Sets",
        "attributes.manage_attribute_sets_description":
          "Manage attribute sets and their assigned attributes.",
        "attributes.add_attribute_set": "Add Attribute Set",
        "attributes.system": "System",
        "attributes.custom": "Custom",
        "attributes.view_details": "View Details",
        "attributes.not_allowed": "Not allowed",
        "attributes.no_attribute_sets_found": "No attribute sets found",
        "attributes.create_first_attribute_set":
          "Create your first attribute set to get started.",
        "attributes.delete_attribute_set": "Delete Attribute Set",
        "attributes.confirm_delete_attribute_set":
          'Are you sure you want to delete the attribute set "{{name}}"? This action cannot be undone.',
        "attributes.manage_attributes_for_set":
          "Manage attributes for this attribute set",
        "attributes.manage_attributes_assigned_to_set":
          "Manage attributes assigned to this set.",
        "attributes.add_attribute": "Add Attribute",
        "attributes.set_information": "Set Information",
        "attributes.n_a": "N/A",
        "attributes.assigned_attributes": "Assigned Attributes",
        "attributes.no_attributes_assigned": "No attributes assigned",
        "attributes.add_attributes_to_set":
          "Add attributes to this set to get started.",
        "attributes.sort_order": "Sort Order",
        "attributes.code": "Code",
        "attributes.input_type": "Input Type",
        "attributes.data_type": "Data Type",
        "attributes.unit": "Unit",
        "attributes.required": "Required",
        "attributes.optional": "Optional",
        "attributes.remove": "Remove",
        "attributes.remove_attribute_from_set": "Remove attribute from set",
        "attributes.attribute_values": "Attribute Values",
        "attributes.manage_attribute_values_description":
          'Manage attribute values like "Red", "Blue", "Small", "Large" for your attributes',
        "attributes.add_new_value": "Add New Value",
        "attributes.total_values": "Total Values",
        "attributes.unique_attributes": "Unique Attributes",
        "attributes.filter_by_attribute": "Filter by Attribute",
        "attributes.all_attributes": "All Attributes",
        "attributes.no_attribute_values_found": "No attribute values found",
        "attributes.create_first_attribute_value":
          "Create your first attribute value to get started.",
        "attributes.delete_attribute_value": "Delete Attribute Value",
        "attributes.confirm_delete_attribute_value":
          'Are you sure you want to delete the value "{{label}}"? This action cannot be undone.',
        "attributes.system_attribute_set": "System attribute set",
        "attributes.no_description": "No description",
        "attributes.view": "View",
        "attributes.edit_attribute_set": "Edit attribute set",
        "attributes.system_sets_cannot_be_deleted":
          "System attribute sets cannot be deleted",
        "attributes.get_started_attribute_sets":
          "Get started by creating your first attribute set to organize product attributes.",
        "attributes.back_to_attribute_sets": "Back to Attribute Sets",
        "attributes.create_first_attribute":
          "Create your first attribute to get started.",
        "attributes.delete_attribute": "Delete Attribute",
        "attributes.confirm_delete_attribute":
          "Are you sure you want to delete the attribute",
        "attributes.action_cannot_be_undone": "This action cannot be undone.",
        "attributes.input_type_select": "Select",
        "attributes.input_type_multiselect": "Multi-select",
        "attributes.input_type_text": "Text",
        "attributes.input_type_number": "Number",
        "attributes.input_type_boolean": "Boolean",
        "attributes.data_type_string": "String",
        "attributes.data_type_number": "Number",
        "attributes.data_type_boolean": "Boolean",

        // Attribute Form Translations
        "attributes.edit_attribute": "Edit Attribute",
        "attributes.add_new_attribute": "Add New Attribute",
        "attributes.attribute_management": "Attribute Management",
        "attributes.attribute_management_description":
          "Create or edit attributes to define product characteristics like color, size, and material.",
        "attributes.code_placeholder": "e.g., color, size, weight",
        "attributes.code_help_text":
          "Unique identifier for the attribute (lowercase, numbers, underscores only)",
        "attributes.name_placeholder": "e.g., Color, Size, Weight",
        "attributes.select_single_choice": "Select (Single Choice)",
        "attributes.multiselect_multiple_choices":
          "Multi-select (Multiple Choices)",
        "attributes.text_input": "Text Input",
        "attributes.number_input": "Number Input",
        "attributes.boolean_yes_no": "Boolean (Yes/No)",
        "attributes.string": "String",
        "attributes.number": "Number",
        "attributes.boolean": "Boolean",
        "attributes.unit_placeholder": "e.g., kg, cm, ml",
        "attributes.unit_help_text": "Optional unit of measurement",
        "attributes.update_attribute_details": "Update the attribute details",
        "attributes.create_new_attribute":
          "Create a new attribute for products",
        "attributes.update_attribute": "Update Attribute",
        "attributes.create_attribute": "Create Attribute",
        "attributes.total_attributes": "Total Attributes",
        "attributes.select_attributes": "Select Attributes",
        "attributes.input_attributes": "Input Attributes",
        "attributes.with_units": "With Units",
        "attributes.required_fields_note": "Fields marked with * are required",
        "attributes.cancel": "Cancel",

        // Attribute Set Form Translations
        "attributes.edit_attribute_set": "Edit Attribute Set",
        "attributes.add_new_attribute_set": "Add New Attribute Set",
        "attributes.attribute_set_management": "Attribute Set Management",
        "attributes.attribute_set_management_description":
          "Create or edit attribute sets to organize attributes into reusable groups for products.",
        "attributes.attribute_set_name_placeholder":
          "e.g., Clothing, Electronics, Books",
        "attributes.attribute_set_name_help_text":
          "A descriptive name for the attribute set",
        "attributes.attribute_set_description_placeholder":
          "Optional description of what this attribute set is used for",
        "attributes.attribute_set_description_help_text":
          "Optional description to help identify the purpose of this attribute set",
        "attributes.note": "Note",
        "attributes.attribute_set_note":
          "After creating the attribute set, you can add attributes to it from the attribute set details page.",
        "attributes.update_attribute_set_details":
          "Update the attribute set details",
        "attributes.create_new_attribute_set":
          "Create a new attribute set to organize attributes",
        "attributes.update_attribute_set": "Update Attribute Set",
        "attributes.create_attribute_set": "Create Attribute Set",

        // Attribute Value Form Translations
        "attributes.edit_attribute_value": "Edit Attribute Value",
        "attributes.add_new_attribute_value": "Add New Attribute Value",
        "attributes.attribute_values_description":
          'Create values like "Red", "Blue", "Small", "Large" for your attributes.',
        "attributes.select_attribute": "Select an attribute...",
        "attributes.choose_attribute_help_text":
          "Choose the attribute this value belongs to",
        "attributes.value_placeholder": "e.g., Red, Blue, Small, Large",
        "attributes.value_help_text":
          'The actual value (e.g., "Red" for Color attribute)',
        "attributes.sort_order_help_text":
          "Lower numbers appear first in dropdowns",
        "attributes.update_attribute_value_details":
          "Update the attribute value details",
        "attributes.create_new_attribute_value":
          "Create a new value for an attribute",
        "attributes.update_value": "Update Value",
        "attributes.create_value": "Create Value",

        // Attribute Values Page Translations
        "attributes.loading_attribute_values": "Loading Attribute Values",
        "attributes.loading_attribute_values_description":
          "Please wait while we fetch the attribute values...",
        "attributes.failed_to_load_attribute_values":
          "Failed to Load Attribute Values",
        "attributes.unexpected_error_loading_attribute_values":
          "An unexpected error occurred while loading attribute values.",
        "attributes.try_again": "Try Again",
        "attributes.filtered_values": "Filtered Values",
        "attributes.sorted_values": "Sorted Values",
        "attributes.attribute_value_management": "Attribute Value Management",
        "attributes.attribute_value_management_description":
          "Manage attribute values and their sorting order. Filter by specific attributes to focus on relevant values.",
        "attributes.no_attribute_values_yet": "No Attribute Values Yet",
        "attributes.get_started_add_attribute_value":
          "Get started by adding your first attribute value to define product characteristics.",
        "attributes.add_first_value": "Add First Value",
        "attributes.no_values_for_attribute": "No Values for This Attribute",
        "attributes.no_values_found_for_attribute":
          "No attribute values found for {{attributeName}}. Try selecting a different attribute or add new values.",
        "attributes.add_value_for_attribute": "Add Value for {{attributeName}}",

        // Attributes Page Translations
        "attributes.loading_attributes": "Loading Attributes",
        "attributes.loading_attributes_description":
          "Please wait while we fetch the attributes...",
        "attributes.failed_to_load_attributes": "Failed to Load Attributes",
        "attributes.unexpected_error_loading_attributes":
          "An unexpected error occurred while loading attributes.",
        "attributes.total_attributes": "Total Attributes",
        "attributes.select_attributes": "Select Attributes",
        "attributes.input_attributes": "Input Attributes",
        "attributes.with_units": "With Units",
        "attributes.attribute_management": "Attribute Management",
        "attributes.attribute_management_description":
          "Manage existing attributes, their input types, and data types. Attributes define the characteristics that can be assigned to products.",
        "attributes.no_attributes_yet": "No Attributes Yet",
        "attributes.get_started_add_attribute":
          "Get started by adding your first attribute to define product characteristics like color, size, and material.",
        "attributes.add_first_attribute": "Add First Attribute",

        // Common button labels
        "attributes.edit": "Edit",
        "attributes.delete": "Delete",
        "attributes.view": "View",

        // Attribute Sets Page Translations
        "attributes.loading_attribute_sets": "Loading Attribute Sets",
        "attributes.loading_attribute_sets_description":
          "Please wait while we fetch the attribute sets...",
        "attributes.failed_to_load_attribute_sets":
          "Failed to Load Attribute Sets",
        "attributes.unexpected_error_loading_attribute_sets":
          "An unexpected error occurred while loading attribute sets.",
        "attributes.total_attribute_sets": "Total Attribute Sets",
        "attributes.system_sets": "System Sets",
        "attributes.custom_sets": "Custom Sets",
        "attributes.attribute_set_management": "Attribute Set Management",
        "attributes.attribute_set_management_description":
          "Manage existing attribute sets, their assigned attributes, and properties. Attribute sets help organize product characteristics into reusable groups.",
        "attributes.no_attribute_sets_yet": "No Attribute Sets Yet",
        "attributes.get_started_create_attribute_set":
          "Get started by creating your first attribute set to organize product attributes into reusable groups.",
        "attributes.add_first_attribute_set": "Add First Attribute Set",

        // Validation translations
        required: "This field is required",
        email_invalid: "Please enter a valid email address",
        min_length: "Minimum length is {min} characters",
        max_length: "Maximum length is {max} characters",

        // Translations translations
        "translations.title": "Translation Management",
        "translations.languages.title": "Languages",
        "translations.translations.title": "Translations",
        "translations.cache.title": "Cache Management",
        "translations.add_language": "Add Language",
        "translations.edit_language": "Edit Language",
        "translations.delete_language": "Delete Language",
        "translations.clear_cache": "Clear Cache",
        "translations.warm_up_cache": "Warm Up Cache",
        "translations.edit_translations": "Edit Translations",
        "translations.select_language": "Select Language",
        "translations.select_namespace": "Select Namespace",
        "translations.search_translations": "Search translations...",
        "translations.key": "Key",
        "translations.value": "Value",
        "translations.notes": "Notes",
        "translations.actions": "Actions",
        "translations.edit": "Edit",
        "translations.delete": "Delete",
        "translations.add_translation": "Add Translation",
        "translations.no_translations": "No translations found",
        "translations.loading": "Loading translations...",
        "translations.error_loading": "Error loading translations",
        "translations.confirm_delete":
          "Are you sure you want to delete this translation?",
        "translations.translation_created": "Translation created successfully",
        "translations.translation_updated": "Translation updated successfully",
        "translations.translation_deleted": "Translation deleted successfully",
        "translations.error_creating": "Error creating translation",
        "translations.error_updating": "Error updating translation",
        "translations.error_deleting": "Error deleting translation",
      };

      // Insert English translations (skip if already exist)
      for (const key of keys) {
        // Get the namespace for this key
        const [namespaceInfo] = await this.execute<RowDataPacket[]>(
          "SELECT name FROM translation_namespaces WHERE id = (SELECT namespaceId FROM translation_keys WHERE id = ?)",
          [key.id]
        );

        if (namespaceInfo.length > 0) {
          const fullKeyPath = `${namespaceInfo[0].name}.${key.key_path}`;
          const translation =
            englishTranslations[
              fullKeyPath as keyof typeof englishTranslations
            ];
          if (translation) {
            // Check if this specific translation already exists
            const [existingTranslation] = await this.execute<RowDataPacket[]>(
              "SELECT id FROM translations WHERE languageId = ? AND keyId = ?",
              [englishId, key.id]
            );

            if (existingTranslation.length === 0) {
              await this.execute(
                `
                INSERT INTO translations (value, isActive, languageId, keyId) 
                VALUES (?, true, ?, ?)
              `,
                [translation, englishId, key.id]
              );
            }
          }
        }
      }

      // Seed French translations
      const frenchId = languageMap.get("fr");
      if (frenchId) {
        const frenchTranslations = {
          // Common translations
          loading: "Chargement...",
          save: "Enregistrer",
          cancel: "Annuler",
          delete: "Supprimer",
          edit: "Modifier",
          create: "Créer",
          search: "Rechercher...",
          no_results: "Aucun résultat trouvé",
          aurora_admin: "Aurora Admin",
          logout: "Déconnexion",
          system: "Système",
          users: "Utilisateurs",
          roles: "Rôles",
          storage: "Stockage",
          e_commerce: "E-Commerce",
          categories: "Catégories",
          products: "Produits",
          attributes: "Attributs",
          attribute_values: "Valeurs d'Attributs",
          attribute_sets: "Ensembles d'Attributs",
          localization: "Localisation",
          translations: "Traductions",

          // Auth translations
          "login.title": "Se connecter",
          "login.email": "Email",
          "login.password": "Mot de passe",
          "login.submit": "Se connecter",
          "login.invalid_credentials": "Email ou mot de passe invalide",

          // Products translations
          "products.title": "Catalogue de Produits",
          "products.subtitle":
            "Maintenez votre catalogue à jour et aligné avec l'inventaire. Gérez les produits, les prix et les catégories pour stimuler les ventes.",
          "products.search_placeholder":
            "Rechercher des produits par nom ou SKU...",
          "products.refresh_categories": "Actualiser les Catégories",
          "products.refresh_categories_tooltip": "Actualiser les catégories",
          "products.refreshing": "Actualisation…",
          "products.add_product": "Ajouter un Produit",
          "products.not_allowed": "Non autorisé",
          "products.loading_title": "Chargement des Produits",
          "products.loading_description":
            "Veuillez patienter pendant que nous récupérons votre catalogue de produits...",
          "products.total_products": "Total Produits",
          "products.published": "Publiés",
          "products.variable_products": "Produits Variables",
          "products.total_value": "Valeur Totale",
          "products.product_management": "Gestion des Produits",
          "products.product_management_description":
            "Gérez votre catalogue de produits, les prix et l'inventaire.",
          "products.showing_results_for": "Affichage des résultats pour",
          "products.failed_to_load_products":
            "Échec du Chargement des Produits",
          "products.unexpected_error_loading_products":
            "Une erreur inattendue s'est produite lors du chargement des produits.",
          "products.try_again": "Réessayer",
          "products.edit_product": "Modifier le Produit",
          "products.delete_product": "Supprimer le Produit",
          "products.confirm_delete_product":
            "Êtes-vous sûr de vouloir supprimer ce produit ?",
          "products.create.title": "Créer un produit",
          "products.edit.title": "Modifier le produit",
          "products.name": "Nom du produit",
          "products.description": "Description",
          "products.price": "Prix",
          "products.sku": "SKU",
          "products.product_name": "Nom du Produit",
          "products.type": "Type",
          "products.categories": "Catégories",
          "products.variant_count": "{{count}} variante",
          "products.more": "plus",
          "products.no_categories": "Aucune catégorie",
          "products.get_started_products":
            "Commencez par ajouter votre premier produit pour construire votre catalogue.",

          // Users translations
          "users.title": "Utilisateurs et Membres",
          "users.subtitle":
            "Gérez les membres de l'espace de travail, les permissions et l'accès. Ajoutez de nouveaux utilisateurs et assignez des rôles pour contrôler ce qu'ils peuvent faire.",
          "users.search_placeholder":
            "Rechercher des utilisateurs par nom ou email...",
          "users.refresh_roles": "Actualiser les Rôles",
          "users.refresh_roles_tooltip": "Actualiser les options de rôles",
          "users.add_user": "Ajouter un Utilisateur",
          "users.not_allowed": "Non autorisé",
          "users.loading_title": "Chargement des Utilisateurs",
          "users.loading_description":
            "Veuillez patienter pendant que nous récupérons les informations utilisateur...",
          "users.total_users": "Total Utilisateurs",
          "users.active_users": "Utilisateurs Actifs",
          "users.administrators": "Administrateurs",
          "users.with_profiles": "Avec Profils",
          "users.user_management": "Gestion des Utilisateurs",
          "users.user_management_description":
            "Gérez les utilisateurs existants, leurs rôles et permissions.",
          "users.showing_results_for": "Affichage des résultats pour",
          "users.no_users_found": "Aucun Utilisateur Trouvé",
          "users.no_users_yet": "Aucun Utilisateur Encore",
          "users.no_users_match_search":
            "Aucun utilisateur ne correspond à votre recherche. Essayez d'ajuster vos termes de recherche.",
          "users.get_started_add_user":
            "Commencez par ajouter votre premier utilisateur à l'espace de travail.",
          "users.add_first_user": "Ajouter le Premier Utilisateur",
          "users.failed_to_load_users": "Échec du Chargement des Utilisateurs",
          "users.unexpected_error_loading_users":
            "Une erreur inattendue s'est produite lors du chargement des utilisateurs.",
          "users.try_again": "Réessayer",
          "users.edit_user": "Modifier l'Utilisateur",
          "users.delete_user": "Supprimer l'Utilisateur",
          "users.confirm_delete_user":
            "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
          "users.create.title": "Créer un utilisateur",
          "users.edit.title": "Modifier l'utilisateur",
          "users.first_name": "Prénom",
          "users.last_name": "Nom de famille",
          "users.email": "Email",
          "users.user_management": "Gestion des Utilisateurs",
          "users.required_fields_note":
            "Tous les champs marqués d'un * sont obligatoires.",
          "users.enter_first_name": "Entrez le prénom",
          "users.enter_last_name": "Entrez le nom de famille",
          "users.enter_email": "Entrez l'adresse email",
          "users.basic_information": "Informations de Base",
          "users.date_of_birth": "Date de Naissance",
          "users.profile_picture": "Photo de Profil",
          "users.no_image": "Aucune Image",
          "users.choose_image": "Choisir une Image",
          "users.remove": "Supprimer",
          "users.uploading": "Téléchargement...",
          "users.roles_permissions": "Rôles et Permissions",
          "users.assign_roles": "Assigner des Rôles",
          "users.loading_roles": "Chargement des rôles...",
          "users.no_roles_available":
            "Aucun rôle disponible ou non autorisé à voir les rôles.",
          "users.hold_ctrl_select_multiple":
            "Maintenez Ctrl/Cmd pour sélectionner plusieurs rôles",
          "users.change_password": "Changer le Mot de Passe",
          "users.new_password": "Nouveau Mot de Passe",
          "users.leave_blank_keep_current":
            "Laissez vide pour garder le mot de passe actuel",
          "users.re_enter_password": "Retaper le nouveau mot de passe",
          "users.cancel": "Annuler",
          "users.update_user": "Mettre à jour l'Utilisateur",
          "users.create_user": "Créer un Utilisateur",
          "users.updating": "Mise à jour...",
          "users.creating": "Création...",
          "users.user_permissions_controlled_by_roles":
            "Les permissions utilisateur sont contrôlées par les rôles assignés",
          "users.avatar": "Avatar",
          "users.admin": "Admin",
          "users.profile_complete": "Profil Complet",
          "users.basic_info_only": "Informations de Base Seulement",
          "users.more": "plus",
          "users.no_roles": "Aucun rôle",
          "users.active": "Actif",
          "users.inactive": "Inactif",
          "users.edit_user_information":
            "Modifier les informations utilisateur",
          "users.delete_user": "Supprimer l'utilisateur",

          // Categories translations
          "categories.product_categories": "Catégories de Produits",
          "categories.page_subtitle":
            "Organisez les produits en groupes clairs et navigables. Créez des catégories hiérarchiques pour améliorer la découverte et la gestion des produits.",
          "categories.search_placeholder":
            "Rechercher des catégories par nom...",
          "categories.not_allowed": "Non autorisé",
          "categories.add_new_category": "Ajouter une Nouvelle Catégorie",
          "categories.access_denied": "Accès Refusé",
          "categories.no_permission_view_categories":
            "Vous n'avez pas la permission de voir les catégories.",
          "categories.loading_categories": "Chargement des Catégories",
          "categories.loading_categories_description":
            "Veuillez patienter pendant que nous récupérons vos informations de catégorie...",
          "categories.failed_to_load_categories":
            "Échec du Chargement des Catégories",
          "categories.unexpected_error_loading_categories":
            "Une erreur inattendue s'est produite lors du chargement des catégories.",
          "categories.try_again": "Réessayer",
          "categories.total_categories": "Total des Catégories",
          "categories.root_categories": "Catégories Racines",
          "categories.subcategories": "Sous-catégories",
          "categories.max_depth": "Profondeur Max",
          "categories.category_management": "Gestion des Catégories",
          "categories.manage_categories_description":
            "Gérez vos catégories de produits et leur hiérarchie.",
          "categories.showing_results_for": "Affichage des résultats pour",
          "categories.edit_category": "Modifier la Catégorie",
          "categories.add_category": "Ajouter une Catégorie",
          "categories.delete_category": "Supprimer la Catégorie",
          "categories.confirm_delete_category":
            "Êtes-vous sûr de vouloir supprimer",
          "categories.this_category": "cette catégorie",
          "categories.delete": "Supprimer",
          "categories.cancel": "Annuler",
          "categories.id": "ID",
          "categories.actions": "Actions",
          "categories.edit": "Modifier",
          "categories.category_name": "Nom de la Catégorie",
          "categories.parent_category": "Catégorie Parente",
          "categories.hierarchy": "Hiérarchie",
          "categories.root": "Racine",
          "categories.top_level_category": "Catégorie de niveau supérieur",
          "categories.subcategory_level": "Sous-catégorie (Niveau {{depth}})",
          "categories.no_parent": "Aucun parent",
          "categories.level": "Niveau",
          "categories.edit_category": "Modifier la catégorie",
          "categories.delete_category": "Supprimer la catégorie",
          "categories.no_categories_found": "Aucune Catégorie Trouvée",
          "categories.get_started_categories":
            "Commencez par créer votre première catégorie de produit pour organiser votre inventaire.",
          "categories.category_management_description":
            "Créez ou modifiez des catégories de produits pour organiser votre inventaire. Les catégories aident les clients à trouver les produits plus facilement.",
          "categories.category_information": "Informations de la Catégorie",
          "categories.category_name": "Nom de la Catégorie",
          "categories.enter_category_name":
            "Entrez le nom de la catégorie (ex: Électronique, Vêtements)",
          "categories.category_name_help":
            "Choisissez un nom clair et descriptif qui aide les clients à trouver les produits.",
          "categories.category_hierarchy": "Hiérarchie des Catégories",
          "categories.parent_category": "Catégorie Parente",
          "categories.parent_category_help":
            "Laissez vide pour créer une catégorie racine, ou sélectionnez un parent pour créer une sous-catégorie.",
          "categories.saving": "Sauvegarde...",
          "categories.updating": "Mise à jour...",
          "categories.creating": "Création...",
          "categories.update_category": "Mettre à jour la Catégorie",
          "categories.create_category": "Créer une Catégorie",

          // Roles translations
          "roles.roles_permissions": "Rôles et Permissions",
          "roles.page_subtitle":
            "Définissez des ensembles de permissions et contrôlez ce que les équipes peuvent accéder. Créez des rôles personnalisés pour correspondre aux besoins de votre organisation.",
          "roles.not_allowed": "Non autorisé",
          "roles.add_new_role": "Ajouter un Nouveau Rôle",
          "roles.no_permission_view_roles":
            "Vous n'avez pas la permission de voir les rôles.",
          "roles.loading_roles": "Chargement des Rôles",
          "roles.loading_roles_description":
            "Veuillez patienter pendant que nous récupérons les informations de rôle...",
          "roles.total_roles": "Total des Rôles",
          "roles.total_permissions": "Total des Permissions",
          "roles.system_roles": "Rôles Système",
          "roles.custom_roles": "Rôles Personnalisés",
          "roles.role_management": "Gestion des Rôles",
          "roles.role_management_description":
            "Gérez les rôles existants et leurs permissions. Les rôles système ne peuvent pas être supprimés.",
          "roles.failed_to_load_roles": "Échec du Chargement des Rôles",
          "roles.unexpected_error_loading_roles":
            "Une erreur inattendue s'est produite lors du chargement des rôles.",
          "roles.try_again": "Réessayer",
          "roles.edit_role": "Modifier le Rôle",
          "roles.add_role": "Ajouter un Rôle",
          "roles.delete_role": "Supprimer le Rôle",
          "roles.confirm_delete_role": "Êtes-vous sûr de vouloir supprimer",
          "roles.this_role": "ce rôle",
          "roles.delete": "Supprimer",
          "roles.cancel": "Annuler",
          "roles.role_name": "Nom du Rôle",
          "roles.permission_count": "{{count}} permission",
          "roles.more_permissions": "plus de permissions",
          "roles.no_permissions_assigned": "Aucune permission assignée",
          "roles.edit_role_permissions": "Modifier les permissions du rôle",
          "roles.delete_role": "Supprimer le rôle",
          "roles.system_roles_cannot_be_deleted":
            "Les rôles système ne peuvent pas être supprimés",
          "roles.no_roles_found": "Aucun Rôle Trouvé",
          "roles.get_started_roles":
            "Commencez par créer votre premier rôle pour définir les permissions utilisateur.",

          // Attributes translations
          "attributes.attributes": "Attributs",
          "attributes.page_subtitle":
            "Gérez les attributs de produits et leurs propriétés.",
          "attributes.not_allowed": "Non autorisé",
          "attributes.add_attribute": "Ajouter un Attribut",
          "attributes.loading": "Chargement...",
          "attributes.failed_to_load_attributes":
            "Échec du chargement des attributs",
          "attributes.id": "ID",
          "attributes.code": "Code",
          "attributes.name": "Nom",
          "attributes.input_type": "Type d'Entrée",
          "attributes.data_type": "Type de Données",
          "attributes.unit": "Unité",
          "attributes.created": "Créé",
          "attributes.actions": "Actions",
          "attributes.no_attributes_found": "Aucun attribut trouvé",
          "attributes.attribute_sets": "Ensembles d'Attributs",
          "attributes.manage_attribute_sets_description":
            "Gérez les ensembles d'attributs et leurs attributs assignés.",
          "attributes.add_attribute_set": "Ajouter un Ensemble d'Attributs",
          "attributes.system": "Système",
          "attributes.custom": "Personnalisé",
          "attributes.view_details": "Voir les Détails",
          "attributes.not_allowed": "Non autorisé",
          "attributes.no_attribute_sets_found":
            "Aucun ensemble d'attributs trouvé",
          "attributes.create_first_attribute_set":
            "Créez votre premier ensemble d'attributs pour commencer.",
          "attributes.delete_attribute_set": "Supprimer l'Ensemble d'Attributs",
          "attributes.confirm_delete_attribute_set":
            "Êtes-vous sûr de vouloir supprimer l'ensemble d'attributs \"{{name}}\" ? Cette action ne peut pas être annulée.",
          "attributes.manage_attributes_for_set":
            "Gérer les attributs pour cet ensemble d'attributs",
          "attributes.manage_attributes_assigned_to_set":
            "Gérer les attributs assignés à cet ensemble.",
          "attributes.add_attribute": "Ajouter un Attribut",
          "attributes.set_information": "Informations de l'Ensemble",
          "attributes.n_a": "N/A",
          "attributes.assigned_attributes": "Attributs Assignés",
          "attributes.no_attributes_assigned": "Aucun attribut assigné",
          "attributes.add_attributes_to_set":
            "Ajoutez des attributs à cet ensemble pour commencer.",
          "attributes.sort_order": "Ordre de Tri",
          "attributes.code": "Code",
          "attributes.input_type": "Type d'Entrée",
          "attributes.data_type": "Type de Données",
          "attributes.unit": "Unité",
          "attributes.required": "Requis",
          "attributes.optional": "Optionnel",
          "attributes.remove": "Supprimer",
          "attributes.remove_attribute_from_set":
            "Supprimer l'attribut de l'ensemble",
          "attributes.attribute_values": "Valeurs d'Attributs",
          "attributes.manage_attribute_values_description":
            'Gérez les valeurs d\'attributs comme "Rouge", "Bleu", "Petit", "Grand" pour vos attributs',
          "attributes.add_new_value": "Ajouter une Nouvelle Valeur",
          "attributes.total_values": "Total des Valeurs",
          "attributes.unique_attributes": "Attributs Uniques",
          "attributes.filter_by_attribute": "Filtrer par Attribut",
          "attributes.all_attributes": "Tous les Attributs",
          "attributes.no_attribute_values_found":
            "Aucune valeur d'attribut trouvée",
          "attributes.create_first_attribute_value":
            "Créez votre première valeur d'attribut pour commencer.",
          "attributes.delete_attribute_value": "Supprimer la Valeur d'Attribut",
          "attributes.confirm_delete_attribute_value":
            'Êtes-vous sûr de vouloir supprimer la valeur "{{label}}" ? Cette action ne peut pas être annulée.',
          "attributes.system_attribute_set": "Ensemble d'attributs système",
          "attributes.no_description": "Aucune description",
          "attributes.view": "Voir",
          "attributes.edit_attribute_set": "Modifier l'ensemble d'attributs",
          "attributes.system_sets_cannot_be_deleted":
            "Les ensembles d'attributs système ne peuvent pas être supprimés",
          "attributes.get_started_attribute_sets":
            "Commencez par créer votre premier ensemble d'attributs pour organiser les attributs de produits.",
          "attributes.back_to_attribute_sets":
            "Retour aux Ensembles d'Attributs",
          "attributes.create_first_attribute":
            "Créez votre premier attribut pour commencer.",
          "attributes.delete_attribute": "Supprimer l'Attribut",
          "attributes.confirm_delete_attribute":
            "Êtes-vous sûr de vouloir supprimer l'attribut",
          "attributes.action_cannot_be_undone":
            "Cette action ne peut pas être annulée.",
          "attributes.input_type_select": "Sélection",
          "attributes.input_type_multiselect": "Multi-sélection",
          "attributes.input_type_text": "Texte",
          "attributes.input_type_number": "Nombre",
          "attributes.input_type_boolean": "Booléen",
          "attributes.data_type_string": "Chaîne",
          "attributes.data_type_number": "Nombre",
          "attributes.data_type_boolean": "Booléen",

          // Attribute Form Translations
          "attributes.edit_attribute": "Modifier l'attribut",
          "attributes.add_new_attribute": "Ajouter un nouvel attribut",
          "attributes.attribute_management": "Gestion des attributs",
          "attributes.attribute_management_description":
            "Créer ou modifier des attributs pour définir les caractéristiques des produits comme la couleur, la taille et le matériau.",
          "attributes.code_placeholder": "ex: couleur, taille, poids",
          "attributes.code_help_text":
            "Identifiant unique pour l'attribut (minuscules, chiffres, traits de soulignement uniquement)",
          "attributes.name_placeholder": "ex: Couleur, Taille, Poids",
          "attributes.select_single_choice": "Sélection (choix unique)",
          "attributes.multiselect_multiple_choices":
            "Sélection multiple (choix multiples)",
          "attributes.text_input": "Saisie de texte",
          "attributes.number_input": "Saisie de nombre",
          "attributes.boolean_yes_no": "Booléen (Oui/Non)",
          "attributes.string": "Chaîne",
          "attributes.number": "Nombre",
          "attributes.boolean": "Booléen",
          "attributes.unit_placeholder": "ex: kg, cm, ml",
          "attributes.unit_help_text": "Unité de mesure optionnelle",
          "attributes.update_attribute_details":
            "Mettre à jour les détails de l'attribut",
          "attributes.create_new_attribute":
            "Créer un nouvel attribut pour les produits",
          "attributes.update_attribute": "Mettre à jour l'attribut",
          "attributes.create_attribute": "Créer l'attribut",
          "attributes.total_attributes": "Total des Attributs",
          "attributes.select_attributes": "Attributs de Sélection",
          "attributes.input_attributes": "Attributs de Saisie",
          "attributes.with_units": "Avec Unités",
          "attributes.required_fields_note":
            "Les champs marqués d'un * sont obligatoires",
          "attributes.cancel": "Annuler",

          // Attribute Set Form Translations
          "attributes.edit_attribute_set": "Modifier l'ensemble d'attributs",
          "attributes.add_new_attribute_set":
            "Ajouter un nouvel ensemble d'attributs",
          "attributes.attribute_set_management":
            "Gestion des ensembles d'attributs",
          "attributes.attribute_set_management_description":
            "Créer ou modifier des ensembles d'attributs pour organiser les attributs en groupes réutilisables pour les produits.",
          "attributes.attribute_set_name_placeholder":
            "ex: Vêtements, Électronique, Livres",
          "attributes.attribute_set_name_help_text":
            "Un nom descriptif pour l'ensemble d'attributs",
          "attributes.attribute_set_description_placeholder":
            "Description optionnelle de ce à quoi sert cet ensemble d'attributs",
          "attributes.attribute_set_description_help_text":
            "Description optionnelle pour aider à identifier le but de cet ensemble d'attributs",
          "attributes.note": "Note",
          "attributes.attribute_set_note":
            "Après avoir créé l'ensemble d'attributs, vous pouvez y ajouter des attributs depuis la page de détails de l'ensemble d'attributs.",
          "attributes.update_attribute_set_details":
            "Mettre à jour les détails de l'ensemble d'attributs",
          "attributes.create_new_attribute_set":
            "Créer un nouvel ensemble d'attributs pour organiser les attributs",
          "attributes.update_attribute_set":
            "Mettre à jour l'ensemble d'attributs",
          "attributes.create_attribute_set": "Créer l'ensemble d'attributs",

          // Attribute Value Form Translations
          "attributes.edit_attribute_value": "Modifier la valeur d'attribut",
          "attributes.add_new_attribute_value":
            "Ajouter une nouvelle valeur d'attribut",
          "attributes.attribute_values_description":
            'Créer des valeurs comme "Rouge", "Bleu", "Petit", "Grand" pour vos attributs.',
          "attributes.select_attribute": "Sélectionner un attribut...",
          "attributes.choose_attribute_help_text":
            "Choisir l'attribut auquel appartient cette valeur",
          "attributes.value_placeholder": "ex: Rouge, Bleu, Petit, Grand",
          "attributes.value_help_text":
            'La valeur réelle (ex: "Rouge" pour l\'attribut Couleur)',
          "attributes.sort_order_help_text":
            "Les nombres plus petits apparaissent en premier dans les listes déroulantes",
          "attributes.update_attribute_value_details":
            "Mettre à jour les détails de la valeur d'attribut",
          "attributes.create_new_attribute_value":
            "Créer une nouvelle valeur pour un attribut",
          "attributes.update_value": "Mettre à jour la valeur",
          "attributes.create_value": "Créer la valeur",

          // Attribute Values Page Translations
          "attributes.loading_attribute_values":
            "Chargement des valeurs d'attributs",
          "attributes.loading_attribute_values_description":
            "Veuillez patienter pendant que nous récupérons les valeurs d'attributs...",
          "attributes.failed_to_load_attribute_values":
            "Échec du chargement des valeurs d'attributs",
          "attributes.unexpected_error_loading_attribute_values":
            "Une erreur inattendue s'est produite lors du chargement des valeurs d'attributs.",
          "attributes.try_again": "Réessayer",
          "attributes.filtered_values": "Valeurs filtrées",
          "attributes.sorted_values": "Valeurs triées",
          "attributes.attribute_value_management":
            "Gestion des valeurs d'attributs",
          "attributes.attribute_value_management_description":
            "Gérez les valeurs d'attributs et leur ordre de tri. Filtrez par attributs spécifiques pour vous concentrer sur les valeurs pertinentes.",
          "attributes.no_attribute_values_yet":
            "Aucune valeur d'attribut pour le moment",
          "attributes.get_started_add_attribute_value":
            "Commencez par ajouter votre première valeur d'attribut pour définir les caractéristiques des produits.",
          "attributes.add_first_value": "Ajouter la première valeur",
          "attributes.no_values_for_attribute":
            "Aucune valeur pour cet attribut",
          "attributes.no_values_found_for_attribute":
            "Aucune valeur d'attribut trouvée pour {{attributeName}}. Essayez de sélectionner un attribut différent ou ajoutez de nouvelles valeurs.",
          "attributes.add_value_for_attribute":
            "Ajouter une valeur pour {{attributeName}}",

          // Attributes Page Translations
          "attributes.loading_attributes": "Chargement des attributs",
          "attributes.loading_attributes_description":
            "Veuillez patienter pendant que nous récupérons les attributs...",
          "attributes.failed_to_load_attributes":
            "Échec du chargement des attributs",
          "attributes.unexpected_error_loading_attributes":
            "Une erreur inattendue s'est produite lors du chargement des attributs.",
          "attributes.total_attributes": "Total des attributs",
          "attributes.select_attributes": "Attributs de sélection",
          "attributes.input_attributes": "Attributs de saisie",
          "attributes.with_units": "Avec unités",
          "attributes.attribute_management": "Gestion des attributs",
          "attributes.attribute_management_description":
            "Gérez les attributs existants, leurs types de saisie et types de données. Les attributs définissent les caractéristiques qui peuvent être assignées aux produits.",
          "attributes.no_attributes_yet": "Aucun attribut pour le moment",
          "attributes.get_started_add_attribute":
            "Commencez par ajouter votre premier attribut pour définir les caractéristiques des produits comme la couleur, la taille et le matériau.",
          "attributes.add_first_attribute": "Ajouter le premier attribut",

          // Common button labels
          "attributes.edit": "Modifier",
          "attributes.delete": "Supprimer",
          "attributes.view": "Voir",

          // Attribute Sets Page Translations
          "attributes.loading_attribute_sets":
            "Chargement des ensembles d'attributs",
          "attributes.loading_attribute_sets_description":
            "Veuillez patienter pendant que nous récupérons les ensembles d'attributs...",
          "attributes.failed_to_load_attribute_sets":
            "Échec du chargement des ensembles d'attributs",
          "attributes.unexpected_error_loading_attribute_sets":
            "Une erreur inattendue s'est produite lors du chargement des ensembles d'attributs.",
          "attributes.total_attribute_sets": "Total des ensembles d'attributs",
          "attributes.system_sets": "Ensembles système",
          "attributes.custom_sets": "Ensembles personnalisés",
          "attributes.attribute_set_management":
            "Gestion des ensembles d'attributs",
          "attributes.attribute_set_management_description":
            "Gérez les ensembles d'attributs existants, leurs attributs assignés et propriétés. Les ensembles d'attributs aident à organiser les caractéristiques des produits en groupes réutilisables.",
          "attributes.no_attribute_sets_yet":
            "Aucun ensemble d'attributs pour le moment",
          "attributes.get_started_create_attribute_set":
            "Commencez par créer votre premier ensemble d'attributs pour organiser les attributs de produits en groupes réutilisables.",
          "attributes.add_first_attribute_set":
            "Ajouter le premier ensemble d'attributs",

          // Validation translations
          required: "Ce champ est obligatoire",
          email_invalid: "Veuillez saisir une adresse email valide",
          min_length: "La longueur minimale est de {min} caractères",
          max_length: "La longueur maximale est de {max} caractères",

          // Translations translations
          "translations.title": "Gestion des traductions",
          "translations.languages.title": "Langues",
          "translations.translations.title": "Traductions",
          "translations.cache.title": "Gestion du cache",
          "translations.add_language": "Ajouter une langue",
          "translations.edit_language": "Modifier la langue",
          "translations.delete_language": "Supprimer la langue",
          "translations.clear_cache": "Vider le cache",
          "translations.warm_up_cache": "Préchauffer le cache",
          "translations.edit_translations": "Modifier les traductions",
          "translations.select_language": "Sélectionner une langue",
          "translations.select_namespace": "Sélectionner un espace de noms",
          "translations.search_translations": "Rechercher des traductions...",
          "translations.key": "Clé",
          "translations.value": "Valeur",
          "translations.notes": "Notes",
          "translations.actions": "Actions",
          "translations.edit": "Modifier",
          "translations.delete": "Supprimer",
          "translations.add_translation": "Ajouter une traduction",
          "translations.no_translations": "Aucune traduction trouvée",
          "translations.loading": "Chargement des traductions...",
          "translations.error_loading":
            "Erreur lors du chargement des traductions",
          "translations.confirm_delete":
            "Êtes-vous sûr de vouloir supprimer cette traduction ?",
          "translations.translation_created": "Traduction créée avec succès",
          "translations.translation_updated":
            "Traduction mise à jour avec succès",
          "translations.translation_deleted":
            "Traduction supprimée avec succès",
          "translations.error_creating":
            "Erreur lors de la création de la traduction",
          "translations.error_updating":
            "Erreur lors de la mise à jour de la traduction",
          "translations.error_deleting":
            "Erreur lors de la suppression de la traduction",
        };

        // Insert French translations (skip if already exist)
        for (const key of keys) {
          // Get the namespace for this key
          const [namespaceInfo] = await this.execute<RowDataPacket[]>(
            "SELECT name FROM translation_namespaces WHERE id = (SELECT namespaceId FROM translation_keys WHERE id = ?)",
            [key.id]
          );

          if (namespaceInfo.length > 0) {
            const fullKeyPath = `${namespaceInfo[0].name}.${key.key_path}`;
            const translation =
              frenchTranslations[
                fullKeyPath as keyof typeof frenchTranslations
              ];
            if (translation) {
              // Check if this specific translation already exists
              const [existingTranslation] = await this.execute<RowDataPacket[]>(
                "SELECT id FROM translations WHERE languageId = ? AND keyId = ?",
                [frenchId, key.id]
              );

              if (existingTranslation.length === 0) {
                await this.execute(
                  `
                  INSERT INTO translations (value, isActive, languageId, keyId) 
                  VALUES (?, true, ?, ?)
                `,
                  [translation, frenchId, key.id]
                );
              }
            }
          }
        }

        this.logger.log("Seeded default French translations");
      }

      // Seed Spanish translations
      const spanishId = languageMap.get("es");
      if (spanishId) {
        const spanishTranslations = {
          // Common translations
          loading: "Cargando...",
          save: "Guardar",
          cancel: "Cancelar",
          delete: "Eliminar",
          edit: "Editar",
          create: "Crear",
          search: "Buscar...",
          no_results: "No se encontraron resultados",
          aurora_admin: "Aurora Admin",
          logout: "Cerrar sesión",
          system: "Sistema",
          users: "Usuarios",
          roles: "Roles",
          storage: "Almacenamiento",
          e_commerce: "E-Commerce",
          categories: "Categorías",
          products: "Productos",
          attributes: "Atributos",
          attribute_values: "Valores de Atributos",
          attribute_sets: "Conjuntos de Atributos",
          localization: "Localización",
          translations: "Traducciones",

          // Auth translations
          "login.title": "Iniciar sesión",
          "login.email": "Correo electrónico",
          "login.password": "Contraseña",
          "login.submit": "Iniciar sesión",
          "login.invalid_credentials":
            "Correo electrónico o contraseña inválidos",

          // Products translations
          "products.title": "Catálogo de Productos",
          "products.subtitle":
            "Mantén tu catálogo actualizado y alineado con el inventario. Gestiona productos, precios y categorías para impulsar las ventas.",
          "products.search_placeholder": "Buscar productos por nombre o SKU...",
          "products.refresh_categories": "Actualizar Categorías",
          "products.refresh_categories_tooltip": "Actualizar categorías",
          "products.refreshing": "Actualizando…",
          "products.add_product": "Añadir Producto",
          "products.not_allowed": "No permitido",
          "products.loading_title": "Cargando Productos",
          "products.loading_description":
            "Por favor espera mientras obtenemos tu catálogo de productos...",
          "products.total_products": "Total Productos",
          "products.published": "Publicados",
          "products.variable_products": "Productos Variables",
          "products.total_value": "Valor Total",
          "products.product_management": "Gestión de Productos",
          "products.product_management_description":
            "Gestiona tu catálogo de productos, precios e inventario.",
          "products.showing_results_for": "Mostrando resultados para",
          "products.failed_to_load_products": "Error al Cargar Productos",
          "products.unexpected_error_loading_products":
            "Ocurrió un error inesperado al cargar los productos.",
          "products.try_again": "Intentar de Nuevo",
          "products.edit_product": "Editar Producto",
          "products.delete_product": "Eliminar Producto",
          "products.confirm_delete_product":
            "¿Estás seguro de que quieres eliminar este producto?",
          "products.create.title": "Crear producto",
          "products.edit.title": "Editar producto",
          "products.name": "Nombre del producto",
          "products.description": "Descripción",
          "products.price": "Precio",
          "products.sku": "SKU",
          "products.product_name": "Nombre del Producto",
          "products.type": "Tipo",
          "products.categories": "Categorías",
          "products.variant_count": "{{count}} variante",
          "products.more": "más",
          "products.no_categories": "Sin categorías",
          "products.get_started_products":
            "Comience agregando su primer producto para construir su catálogo.",

          // Users translations
          "users.title": "Usuarios y Miembros",
          "users.subtitle":
            "Gestiona miembros del espacio de trabajo, permisos y acceso. Añade nuevos usuarios y asigna roles para controlar lo que pueden hacer.",
          "users.search_placeholder": "Buscar usuarios por nombre o email...",
          "users.refresh_roles": "Actualizar Roles",
          "users.refresh_roles_tooltip": "Actualizar opciones de roles",
          "users.add_user": "Añadir Usuario",
          "users.not_allowed": "No permitido",
          "users.loading_title": "Cargando Usuarios",
          "users.loading_description":
            "Por favor espera mientras obtenemos la información del usuario...",
          "users.total_users": "Total Usuarios",
          "users.active_users": "Usuarios Activos",
          "users.administrators": "Administradores",
          "users.with_profiles": "Con Perfiles",
          "users.user_management": "Gestión de Usuarios",
          "users.user_management_description":
            "Gestiona usuarios existentes, sus roles y permisos.",
          "users.showing_results_for": "Mostrando resultados para",
          "users.no_users_found": "No se Encontraron Usuarios",
          "users.no_users_yet": "Aún No Hay Usuarios",
          "users.no_users_match_search":
            "Ningún usuario coincide con tu búsqueda. Intenta ajustar tus términos de búsqueda.",
          "users.get_started_add_user":
            "Comienza añadiendo tu primer usuario al espacio de trabajo.",
          "users.add_first_user": "Añadir Primer Usuario",
          "users.failed_to_load_users": "Error al Cargar Usuarios",
          "users.unexpected_error_loading_users":
            "Ocurrió un error inesperado al cargar los usuarios.",
          "users.try_again": "Intentar de Nuevo",
          "users.edit_user": "Editar Usuario",
          "users.delete_user": "Eliminar Usuario",
          "users.confirm_delete_user":
            "¿Estás seguro de que quieres eliminar este usuario?",
          "users.create.title": "Crear usuario",
          "users.edit.title": "Editar usuario",
          "users.first_name": "Nombre",
          "users.last_name": "Apellido",
          "users.email": "Correo electrónico",
          "users.user_management": "Gestión de Usuarios",
          "users.required_fields_note":
            "Todos los campos marcados con * son obligatorios.",
          "users.enter_first_name": "Ingrese el nombre",
          "users.enter_last_name": "Ingrese el apellido",
          "users.enter_email": "Ingrese la dirección de correo electrónico",
          "users.basic_information": "Información Básica",
          "users.date_of_birth": "Fecha de Nacimiento",
          "users.profile_picture": "Foto de Perfil",
          "users.no_image": "Sin Imagen",
          "users.choose_image": "Elegir Imagen",
          "users.remove": "Eliminar",
          "users.uploading": "Subiendo...",
          "users.roles_permissions": "Roles y Permisos",
          "users.assign_roles": "Asignar Roles",
          "users.loading_roles": "Cargando roles...",
          "users.no_roles_available":
            "No hay roles disponibles o no autorizado para ver roles.",
          "users.hold_ctrl_select_multiple":
            "Mantén Ctrl/Cmd para seleccionar múltiples roles",
          "users.change_password": "Cambiar Contraseña",
          "users.new_password": "Nueva Contraseña",
          "users.leave_blank_keep_current":
            "Deja en blanco para mantener la contraseña actual",
          "users.re_enter_password": "Reingresa la nueva contraseña",
          "users.cancel": "Cancelar",
          "users.update_user": "Actualizar Usuario",
          "users.create_user": "Crear Usuario",
          "users.updating": "Actualizando...",
          "users.creating": "Creando...",
          "users.user_permissions_controlled_by_roles":
            "Los permisos de usuario están controlados por los roles asignados",
          "users.avatar": "Avatar",
          "users.admin": "Admin",
          "users.profile_complete": "Perfil Completo",
          "users.basic_info_only": "Solo Información Básica",
          "users.more": "más",
          "users.no_roles": "Sin roles",
          "users.active": "Activo",
          "users.inactive": "Inactivo",
          "users.edit_user_information": "Editar información del usuario",
          "users.delete_user": "Eliminar usuario",

          // Categories translations
          "categories.product_categories": "Categorías de Productos",
          "categories.page_subtitle":
            "Organice productos en grupos claros y navegables. Cree categorías jerárquicas para mejorar el descubrimiento y la gestión de productos.",
          "categories.search_placeholder": "Buscar categorías por nombre...",
          "categories.not_allowed": "No permitido",
          "categories.add_new_category": "Agregar Nueva Categoría",
          "categories.access_denied": "Acceso Denegado",
          "categories.no_permission_view_categories":
            "No tiene permiso para ver categorías.",
          "categories.loading_categories": "Cargando Categorías",
          "categories.loading_categories_description":
            "Por favor espere mientras obtenemos su información de categoría...",
          "categories.failed_to_load_categories": "Error al Cargar Categorías",
          "categories.unexpected_error_loading_categories":
            "Ocurrió un error inesperado al cargar las categorías.",
          "categories.try_again": "Intentar de Nuevo",
          "categories.total_categories": "Total de Categorías",
          "categories.root_categories": "Categorías Raíz",
          "categories.subcategories": "Subcategorías",
          "categories.max_depth": "Profundidad Máxima",
          "categories.category_management": "Gestión de Categorías",
          "categories.manage_categories_description":
            "Gestione sus categorías de productos y su jerarquía.",
          "categories.showing_results_for": "Mostrando resultados para",
          "categories.edit_category": "Editar Categoría",
          "categories.add_category": "Agregar Categoría",
          "categories.delete_category": "Eliminar Categoría",
          "categories.confirm_delete_category":
            "¿Está seguro de que desea eliminar",
          "categories.this_category": "esta categoría",
          "categories.delete": "Eliminar",
          "categories.cancel": "Cancelar",
          "categories.id": "ID",
          "categories.actions": "Acciones",
          "categories.edit": "Editar",
          "categories.category_name": "Nombre de la Categoría",
          "categories.parent_category": "Categoría Padre",
          "categories.hierarchy": "Jerarquía",
          "categories.root": "Raíz",
          "categories.top_level_category": "Categoría de nivel superior",
          "categories.subcategory_level": "Subcategoría (Nivel {{depth}})",
          "categories.no_parent": "Sin padre",
          "categories.level": "Nivel",
          "categories.edit_category": "Editar categoría",
          "categories.delete_category": "Eliminar categoría",
          "categories.no_categories_found": "No se Encontraron Categorías",
          "categories.get_started_categories":
            "Comience creando su primera categoría de producto para organizar su inventario.",
          "categories.category_management_description":
            "Cree o edite categorías de productos para organizar su inventario. Las categorías ayudan a los clientes a encontrar productos más fácilmente.",
          "categories.category_information": "Información de la Categoría",
          "categories.category_name": "Nombre de la Categoría",
          "categories.enter_category_name":
            "Ingrese el nombre de la categoría (ej: Electrónicos, Ropa)",
          "categories.category_name_help":
            "Elija un nombre claro y descriptivo que ayude a los clientes a encontrar productos.",
          "categories.category_hierarchy": "Jerarquía de Categorías",
          "categories.parent_category": "Categoría Padre",
          "categories.parent_category_help":
            "Deje vacío para crear una categoría raíz, o seleccione un padre para crear una subcategoría.",
          "categories.saving": "Guardando...",
          "categories.updating": "Actualizando...",
          "categories.creating": "Creando...",
          "categories.update_category": "Actualizar Categoría",
          "categories.create_category": "Crear Categoría",

          // Roles translations
          "roles.roles_permissions": "Roles y Permisos",
          "roles.page_subtitle":
            "Defina conjuntos de permisos y controle a qué pueden acceder los equipos. Cree roles personalizados para satisfacer las necesidades de su organización.",
          "roles.not_allowed": "No permitido",
          "roles.add_new_role": "Agregar Nuevo Rol",
          "roles.no_permission_view_roles": "No tiene permiso para ver roles.",
          "roles.loading_roles": "Cargando Roles",
          "roles.loading_roles_description":
            "Por favor espere mientras obtenemos la información del rol...",
          "roles.total_roles": "Total de Roles",
          "roles.total_permissions": "Total de Permisos",
          "roles.system_roles": "Roles del Sistema",
          "roles.custom_roles": "Roles Personalizados",
          "roles.role_management": "Gestión de Roles",
          "roles.role_management_description":
            "Gestione roles existentes y sus permisos. Los roles del sistema no pueden ser eliminados.",
          "roles.failed_to_load_roles": "Error al Cargar Roles",
          "roles.unexpected_error_loading_roles":
            "Ocurrió un error inesperado al cargar los roles.",
          "roles.try_again": "Intentar de Nuevo",
          "roles.edit_role": "Editar Rol",
          "roles.add_role": "Agregar Rol",
          "roles.delete_role": "Eliminar Rol",
          "roles.confirm_delete_role": "¿Está seguro de que desea eliminar",
          "roles.this_role": "este rol",
          "roles.delete": "Eliminar",
          "roles.cancel": "Cancelar",
          "roles.role_name": "Nombre del Rol",
          "roles.permission_count": "{{count}} permiso",
          "roles.more_permissions": "más permisos",
          "roles.no_permissions_assigned": "Sin permisos asignados",
          "roles.edit_role_permissions": "Editar permisos del rol",
          "roles.delete_role": "Eliminar rol",
          "roles.system_roles_cannot_be_deleted":
            "Los roles del sistema no pueden ser eliminados",
          "roles.no_roles_found": "No se Encontraron Roles",
          "roles.get_started_roles":
            "Comience creando su primer rol para definir permisos de usuario.",

          // Attributes translations
          "attributes.attributes": "Atributos",
          "attributes.page_subtitle":
            "Gestione atributos de productos y sus propiedades.",
          "attributes.not_allowed": "No permitido",
          "attributes.add_attribute": "Agregar Atributo",
          "attributes.loading": "Cargando...",
          "attributes.failed_to_load_attributes": "Error al cargar atributos",
          "attributes.id": "ID",
          "attributes.code": "Código",
          "attributes.name": "Nombre",
          "attributes.input_type": "Tipo de Entrada",
          "attributes.data_type": "Tipo de Datos",
          "attributes.unit": "Unidad",
          "attributes.created": "Creado",
          "attributes.actions": "Acciones",
          "attributes.no_attributes_found": "No se encontraron atributos",
          "attributes.attribute_sets": "Conjuntos de Atributos",
          "attributes.manage_attribute_sets_description":
            "Gestiona los conjuntos de atributos y sus atributos asignados.",
          "attributes.add_attribute_set": "Agregar Conjunto de Atributos",
          "attributes.system": "Sistema",
          "attributes.custom": "Personalizado",
          "attributes.view_details": "Ver Detalles",
          "attributes.not_allowed": "No permitido",
          "attributes.no_attribute_sets_found":
            "No se encontraron conjuntos de atributos",
          "attributes.create_first_attribute_set":
            "Crea tu primer conjunto de atributos para comenzar.",
          "attributes.delete_attribute_set": "Eliminar Conjunto de Atributos",
          "attributes.confirm_delete_attribute_set":
            '¿Estás seguro de que quieres eliminar el conjunto de atributos "{{name}}"? Esta acción no se puede deshacer.',
          "attributes.manage_attributes_for_set":
            "Gestionar atributos para este conjunto de atributos",
          "attributes.manage_attributes_assigned_to_set":
            "Gestionar atributos asignados a este conjunto.",
          "attributes.add_attribute": "Agregar Atributo",
          "attributes.set_information": "Información del Conjunto",
          "attributes.n_a": "N/A",
          "attributes.assigned_attributes": "Atributos Asignados",
          "attributes.no_attributes_assigned": "No hay atributos asignados",
          "attributes.add_attributes_to_set":
            "Agrega atributos a este conjunto para comenzar.",
          "attributes.sort_order": "Orden de Clasificación",
          "attributes.code": "Código",
          "attributes.input_type": "Tipo de Entrada",
          "attributes.data_type": "Tipo de Datos",
          "attributes.unit": "Unidad",
          "attributes.required": "Requerido",
          "attributes.optional": "Opcional",
          "attributes.remove": "Eliminar",
          "attributes.remove_attribute_from_set":
            "Eliminar atributo del conjunto",
          "attributes.attribute_values": "Valores de Atributos",
          "attributes.manage_attribute_values_description":
            'Gestiona valores de atributos como "Rojo", "Azul", "Pequeño", "Grande" para tus atributos',
          "attributes.add_new_value": "Agregar Nuevo Valor",
          "attributes.total_values": "Total de Valores",
          "attributes.unique_attributes": "Atributos Únicos",
          "attributes.filter_by_attribute": "Filtrar por Atributo",
          "attributes.all_attributes": "Todos los Atributos",
          "attributes.no_attribute_values_found":
            "No se encontraron valores de atributos",
          "attributes.create_first_attribute_value":
            "Crea tu primer valor de atributo para comenzar.",
          "attributes.delete_attribute_value": "Eliminar Valor de Atributo",
          "attributes.confirm_delete_attribute_value":
            '¿Estás seguro de que quieres eliminar el valor "{{label}}"? Esta acción no se puede deshacer.',
          "attributes.system_attribute_set":
            "Conjunto de atributos del sistema",
          "attributes.no_description": "Sin descripción",
          "attributes.view": "Ver",
          "attributes.edit_attribute_set": "Editar conjunto de atributos",
          "attributes.system_sets_cannot_be_deleted":
            "Los conjuntos de atributos del sistema no pueden ser eliminados",
          "attributes.get_started_attribute_sets":
            "Comience creando su primer conjunto de atributos para organizar los atributos de productos.",
          "attributes.back_to_attribute_sets":
            "Volver a Conjuntos de Atributos",
          "attributes.create_first_attribute":
            "Cree su primer atributo para comenzar.",
          "attributes.delete_attribute": "Eliminar Atributo",
          "attributes.confirm_delete_attribute":
            "¿Está seguro de que desea eliminar el atributo",
          "attributes.action_cannot_be_undone":
            "Esta acción no se puede deshacer.",
          "attributes.input_type_select": "Selección",
          "attributes.input_type_multiselect": "Multi-selección",
          "attributes.input_type_text": "Texto",
          "attributes.input_type_number": "Número",
          "attributes.input_type_boolean": "Booleano",
          "attributes.data_type_string": "Cadena",
          "attributes.data_type_number": "Número",
          "attributes.data_type_boolean": "Booleano",

          // Attribute Form Translations
          "attributes.edit_attribute": "Editar Atributo",
          "attributes.add_new_attribute": "Agregar Nuevo Atributo",
          "attributes.attribute_management": "Gestión de Atributos",
          "attributes.attribute_management_description":
            "Crear o editar atributos para definir características de productos como color, tamaño y material.",
          "attributes.code_placeholder": "ej: color, tamaño, peso",
          "attributes.code_help_text":
            "Identificador único para el atributo (solo minúsculas, números y guiones bajos)",
          "attributes.name_placeholder": "ej: Color, Tamaño, Peso",
          "attributes.select_single_choice": "Selección (opción única)",
          "attributes.multiselect_multiple_choices":
            "Selección múltiple (opciones múltiples)",
          "attributes.text_input": "Entrada de texto",
          "attributes.number_input": "Entrada de número",
          "attributes.boolean_yes_no": "Booleano (Sí/No)",
          "attributes.string": "Cadena",
          "attributes.number": "Número",
          "attributes.boolean": "Booleano",
          "attributes.unit_placeholder": "ej: kg, cm, ml",
          "attributes.unit_help_text": "Unidad de medida opcional",
          "attributes.update_attribute_details":
            "Actualizar los detalles del atributo",
          "attributes.create_new_attribute":
            "Crear un nuevo atributo para productos",
          "attributes.update_attribute": "Actualizar Atributo",
          "attributes.create_attribute": "Crear Atributo",
          "attributes.total_attributes": "Total de Atributos",
          "attributes.select_attributes": "Atributos de Selección",
          "attributes.input_attributes": "Atributos de Entrada",
          "attributes.with_units": "Con Unidades",
          "attributes.required_fields_note":
            "Los campos marcados con * son obligatorios",
          "attributes.cancel": "Cancelar",

          // Attribute Set Form Translations
          "attributes.edit_attribute_set": "Editar Conjunto de Atributos",
          "attributes.add_new_attribute_set":
            "Agregar Nuevo Conjunto de Atributos",
          "attributes.attribute_set_management":
            "Gestión de Conjuntos de Atributos",
          "attributes.attribute_set_management_description":
            "Crear o editar conjuntos de atributos para organizar atributos en grupos reutilizables para productos.",
          "attributes.attribute_set_name_placeholder":
            "ej: Ropa, Electrónicos, Libros",
          "attributes.attribute_set_name_help_text":
            "Un nombre descriptivo para el conjunto de atributos",
          "attributes.attribute_set_description_placeholder":
            "Descripción opcional de para qué se usa este conjunto de atributos",
          "attributes.attribute_set_description_help_text":
            "Descripción opcional para ayudar a identificar el propósito de este conjunto de atributos",
          "attributes.note": "Nota",
          "attributes.attribute_set_note":
            "Después de crear el conjunto de atributos, puede agregar atributos desde la página de detalles del conjunto de atributos.",
          "attributes.update_attribute_set_details":
            "Actualizar los detalles del conjunto de atributos",
          "attributes.create_new_attribute_set":
            "Crear un nuevo conjunto de atributos para organizar atributos",
          "attributes.update_attribute_set": "Actualizar Conjunto de Atributos",
          "attributes.create_attribute_set": "Crear Conjunto de Atributos",

          // Attribute Value Form Translations
          "attributes.edit_attribute_value": "Editar Valor de Atributo",
          "attributes.add_new_attribute_value":
            "Agregar Nuevo Valor de Atributo",
          "attributes.attribute_values_description":
            'Crear valores como "Rojo", "Azul", "Pequeño", "Grande" para sus atributos.',
          "attributes.select_attribute": "Seleccionar un atributo...",
          "attributes.choose_attribute_help_text":
            "Elegir el atributo al que pertenece este valor",
          "attributes.value_placeholder": "ej: Rojo, Azul, Pequeño, Grande",
          "attributes.value_help_text":
            'El valor real (ej: "Rojo" para el atributo Color)',
          "attributes.sort_order_help_text":
            "Los números más pequeños aparecen primero en las listas desplegables",
          "attributes.update_attribute_value_details":
            "Actualizar los detalles del valor de atributo",
          "attributes.create_new_attribute_value":
            "Crear un nuevo valor para un atributo",
          "attributes.update_value": "Actualizar Valor",
          "attributes.create_value": "Crear Valor",

          // Attribute Values Page Translations
          "attributes.loading_attribute_values":
            "Cargando Valores de Atributos",
          "attributes.loading_attribute_values_description":
            "Por favor espere mientras obtenemos los valores de atributos...",
          "attributes.failed_to_load_attribute_values":
            "Error al Cargar Valores de Atributos",
          "attributes.unexpected_error_loading_attribute_values":
            "Ocurrió un error inesperado al cargar los valores de atributos.",
          "attributes.try_again": "Intentar de Nuevo",
          "attributes.filtered_values": "Valores Filtrados",
          "attributes.sorted_values": "Valores Ordenados",
          "attributes.attribute_value_management":
            "Gestión de Valores de Atributos",
          "attributes.attribute_value_management_description":
            "Gestione los valores de atributos y su orden de clasificación. Filtre por atributos específicos para enfocarse en valores relevantes.",
          "attributes.no_attribute_values_yet":
            "Aún No Hay Valores de Atributos",
          "attributes.get_started_add_attribute_value":
            "Comience agregando su primer valor de atributo para definir las características de los productos.",
          "attributes.add_first_value": "Agregar Primer Valor",
          "attributes.no_values_for_attribute":
            "No Hay Valores para Este Atributo",
          "attributes.no_values_found_for_attribute":
            "No se encontraron valores de atributos para {{attributeName}}. Intente seleccionar un atributo diferente o agregue nuevos valores.",
          "attributes.add_value_for_attribute":
            "Agregar Valor para {{attributeName}}",

          // Attributes Page Translations
          "attributes.loading_attributes": "Cargando Atributos",
          "attributes.loading_attributes_description":
            "Por favor espere mientras obtenemos los atributos...",
          "attributes.failed_to_load_attributes": "Error al Cargar Atributos",
          "attributes.unexpected_error_loading_attributes":
            "Ocurrió un error inesperado al cargar los atributos.",
          "attributes.total_attributes": "Total de Atributos",
          "attributes.select_attributes": "Atributos de Selección",
          "attributes.input_attributes": "Atributos de Entrada",
          "attributes.with_units": "Con Unidades",
          "attributes.attribute_management": "Gestión de Atributos",
          "attributes.attribute_management_description":
            "Gestione los atributos existentes, sus tipos de entrada y tipos de datos. Los atributos definen las características que pueden asignarse a los productos.",
          "attributes.no_attributes_yet": "Aún No Hay Atributos",
          "attributes.get_started_add_attribute":
            "Comience agregando su primer atributo para definir las características de los productos como color, tamaño y material.",
          "attributes.add_first_attribute": "Agregar Primer Atributo",

          // Common button labels
          "attributes.edit": "Editar",
          "attributes.delete": "Eliminar",
          "attributes.view": "Ver",

          // Attribute Sets Page Translations
          "attributes.loading_attribute_sets":
            "Cargando Conjuntos de Atributos",
          "attributes.loading_attribute_sets_description":
            "Por favor espere mientras obtenemos los conjuntos de atributos...",
          "attributes.failed_to_load_attribute_sets":
            "Error al Cargar Conjuntos de Atributos",
          "attributes.unexpected_error_loading_attribute_sets":
            "Ocurrió un error inesperado al cargar los conjuntos de atributos.",
          "attributes.total_attribute_sets": "Total de Conjuntos de Atributos",
          "attributes.system_sets": "Conjuntos del Sistema",
          "attributes.custom_sets": "Conjuntos Personalizados",
          "attributes.attribute_set_management":
            "Gestión de Conjuntos de Atributos",
          "attributes.attribute_set_management_description":
            "Gestione los conjuntos de atributos existentes, sus atributos asignados y propiedades. Los conjuntos de atributos ayudan a organizar las características de los productos en grupos reutilizables.",
          "attributes.no_attribute_sets_yet":
            "Aún No Hay Conjuntos de Atributos",
          "attributes.get_started_create_attribute_set":
            "Comience creando su primer conjunto de atributos para organizar los atributos de productos en grupos reutilizables.",
          "attributes.add_first_attribute_set":
            "Agregar Primer Conjunto de Atributos",

          // Validation translations
          required: "Este campo es obligatorio",
          email_invalid:
            "Por favor ingrese una dirección de correo electrónico válida",
          min_length: "La longitud mínima es de {min} caracteres",
          max_length: "La longitud máxima es de {max} caracteres",

          // Translations translations
          "translations.title": "Gestión de traducciones",
          "translations.languages.title": "Idiomas",
          "translations.translations.title": "Traducciones",
          "translations.cache.title": "Gestión de caché",
          "translations.add_language": "Agregar idioma",
          "translations.edit_language": "Editar idioma",
          "translations.delete_language": "Eliminar idioma",
          "translations.clear_cache": "Limpiar caché",
          "translations.warm_up_cache": "Precalentar caché",
          "translations.edit_translations": "Editar traducciones",
          "translations.select_language": "Seleccionar idioma",
          "translations.select_namespace": "Seleccionar espacio de nombres",
          "translations.search_translations": "Buscar traducciones...",
          "translations.key": "Clave",
          "translations.value": "Valor",
          "translations.notes": "Notas",
          "translations.actions": "Acciones",
          "translations.edit": "Editar",
          "translations.delete": "Eliminar",
          "translations.add_translation": "Añadir traducción",
          "translations.no_translations": "No se encontraron traducciones",
          "translations.loading": "Cargando traducciones...",
          "translations.error_loading": "Error al cargar traducciones",
          "translations.confirm_delete":
            "¿Estás seguro de que quieres eliminar esta traducción?",
          "translations.translation_created": "Traducción creada exitosamente",
          "translations.translation_updated":
            "Traducción actualizada exitosamente",
          "translations.translation_deleted":
            "Traducción eliminada exitosamente",
          "translations.error_creating": "Error al crear traducción",
          "translations.error_updating": "Error al actualizar traducción",
          "translations.error_deleting": "Error al eliminar traducción",
        };

        // Insert Spanish translations (skip if already exist)
        for (const key of keys) {
          // Get the namespace for this key
          const [namespaceInfo] = await this.execute<RowDataPacket[]>(
            "SELECT name FROM translation_namespaces WHERE id = (SELECT namespaceId FROM translation_keys WHERE id = ?)",
            [key.id]
          );

          if (namespaceInfo.length > 0) {
            const fullKeyPath = `${namespaceInfo[0].name}.${key.key_path}`;
            const translation =
              spanishTranslations[
                fullKeyPath as keyof typeof spanishTranslations
              ];
            if (translation) {
              // Check if this specific translation already exists
              const [existingTranslation] = await this.execute<RowDataPacket[]>(
                "SELECT id FROM translations WHERE languageId = ? AND keyId = ?",
                [spanishId, key.id]
              );

              if (existingTranslation.length === 0) {
                await this.execute(
                  `
                  INSERT INTO translations (value, isActive, languageId, keyId) 
                  VALUES (?, true, ?, ?)
                `,
                  [translation, spanishId, key.id]
                );
              }
            }
          }
        }

        this.logger.log("Seeded default Spanish translations");
      }

      // Seed German translations
      const germanId = languageMap.get("de");
      if (germanId) {
        const germanTranslations = {
          // Common translations
          loading: "Laden...",
          save: "Speichern",
          cancel: "Abbrechen",
          delete: "Löschen",
          edit: "Bearbeiten",
          create: "Erstellen",
          search: "Suchen...",
          no_results: "Keine Ergebnisse gefunden",

          // Auth translations
          "login.title": "Anmelden",
          "login.email": "E-Mail",
          "login.password": "Passwort",
          "login.submit": "Anmelden",
          "login.invalid_credentials": "Ungültige E-Mail oder Passwort",

          // Products translations
          "products.title": "Produkte",
          "products.create.title": "Produkt erstellen",
          "products.edit.title": "Produkt bearbeiten",
          "products.name": "Produktname",
          "products.description": "Beschreibung",
          "products.price": "Preis",
          "products.sku": "SKU",

          // Users translations
          "users.title": "Benutzer",
          "users.create.title": "Benutzer erstellen",
          "users.edit.title": "Benutzer bearbeiten",
          "users.first_name": "Vorname",
          "users.last_name": "Nachname",
          "users.email": "E-Mail",

          // Validation translations
          required: "Dieses Feld ist erforderlich",
          email_invalid: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
          min_length: "Mindestlänge ist {min} Zeichen",
          max_length: "Maximale Länge ist {max} Zeichen",

          // Translations translations
          "translations.title": "Übersetzungsverwaltung",
          "translations.languages.title": "Sprachen",
          "translations.translations.title": "Übersetzungen",
          "translations.cache.title": "Cache-Verwaltung",
          "translations.add_language": "Sprache hinzufügen",
          "translations.edit_language": "Sprache bearbeiten",
          "translations.delete_language": "Sprache löschen",
          "translations.clear_cache": "Cache leeren",
          "translations.warm_up_cache": "Cache vorwärmen",
        };

        // Insert German translations (skip if already exist)
        for (const key of keys) {
          // Get the namespace for this key
          const [namespaceInfo] = await this.execute<RowDataPacket[]>(
            "SELECT name FROM translation_namespaces WHERE id = (SELECT namespaceId FROM translation_keys WHERE id = ?)",
            [key.id]
          );

          if (namespaceInfo.length > 0) {
            const fullKeyPath = `${namespaceInfo[0].name}.${key.key_path}`;
            const translation =
              germanTranslations[
                fullKeyPath as keyof typeof germanTranslations
              ];
            if (translation) {
              // Check if this specific translation already exists
              const [existingTranslation] = await this.execute<RowDataPacket[]>(
                "SELECT id FROM translations WHERE languageId = ? AND keyId = ?",
                [germanId, key.id]
              );

              if (existingTranslation.length === 0) {
                await this.execute(
                  `
                  INSERT INTO translations (value, isActive, languageId, keyId) 
                  VALUES (?, true, ?, ?)
                `,
                  [translation, germanId, key.id]
                );
              }
            }
          }
        }

        this.logger.log("Seeded default German translations");
      }

      // Seed Italian translations
      const italianId = languageMap.get("it");
      if (italianId) {
        const italianTranslations = {
          // Common translations
          loading: "Caricamento...",
          save: "Salva",
          cancel: "Annulla",
          delete: "Elimina",
          edit: "Modifica",
          create: "Crea",
          search: "Cerca...",
          no_results: "Nessun risultato trovato",

          // Auth translations
          "login.title": "Accedi",
          "login.email": "Email",
          "login.password": "Password",
          "login.submit": "Accedi",
          "login.invalid_credentials": "Email o password non validi",

          // Products translations
          "products.title": "Prodotti",
          "products.create.title": "Crea prodotto",
          "products.edit.title": "Modifica prodotto",
          "products.name": "Nome prodotto",
          "products.description": "Descrizione",
          "products.price": "Prezzo",
          "products.sku": "SKU",

          // Users translations
          "users.title": "Utenti",
          "users.create.title": "Crea utente",
          "users.edit.title": "Modifica utente",
          "users.first_name": "Nome",
          "users.last_name": "Cognome",
          "users.email": "Email",

          // Validation translations
          required: "Questo campo è obbligatorio",
          email_invalid: "Inserisci un indirizzo email valido",
          min_length: "La lunghezza minima è di {min} caratteri",
          max_length: "La lunghezza massima è di {max} caratteri",

          // Translations translations
          "translations.title": "Gestione traduzioni",
          "translations.languages.title": "Lingue",
          "translations.translations.title": "Traduzioni",
          "translations.cache.title": "Gestione cache",
          "translations.add_language": "Aggiungi lingua",
          "translations.edit_language": "Modifica lingua",
          "translations.delete_language": "Elimina lingua",
          "translations.clear_cache": "Svuota cache",
          "translations.warm_up_cache": "Riscalda cache",
        };

        // Insert Italian translations (skip if already exist)
        for (const key of keys) {
          // Get the namespace for this key
          const [namespaceInfo] = await this.execute<RowDataPacket[]>(
            "SELECT name FROM translation_namespaces WHERE id = (SELECT namespaceId FROM translation_keys WHERE id = ?)",
            [key.id]
          );

          if (namespaceInfo.length > 0) {
            const fullKeyPath = `${namespaceInfo[0].name}.${key.key_path}`;
            const translation =
              italianTranslations[
                fullKeyPath as keyof typeof italianTranslations
              ];
            if (translation) {
              // Check if this specific translation already exists
              const [existingTranslation] = await this.execute<RowDataPacket[]>(
                "SELECT id FROM translations WHERE languageId = ? AND keyId = ?",
                [italianId, key.id]
              );

              if (existingTranslation.length === 0) {
                await this.execute(
                  `
                  INSERT INTO translations (value, isActive, languageId, keyId) 
                  VALUES (?, true, ?, ?)
                `,
                  [translation, italianId, key.id]
                );
              }
            }
          }
        }

        this.logger.log("Seeded default Italian translations");
      }
    }

    this.logger.log("Seeded default English translations");
  }
}
