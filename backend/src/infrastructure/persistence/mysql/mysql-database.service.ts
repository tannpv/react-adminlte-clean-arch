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
  DEFAULT_SELLER_PERMISSIONS,
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
      process.env.DB_NAME !== undefined
        ? process.env.DB_NAME
        : "admin_dashboard";

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

    // Translation system tables
    await this.execute(`
      CREATE TABLE IF NOT EXISTS languages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(5) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        native_name VARCHAR(100) NULL,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        INDEX idx_languages_code (code),
        INDEX idx_languages_active (is_active),
        INDEX idx_languages_default (is_default)
      ) ENGINE=InnoDB;
    `);

    await this.execute(`
      CREATE TABLE IF NOT EXISTS language_values (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_hash VARCHAR(32) NOT NULL,
        language_code VARCHAR(5) NOT NULL,
        original_key TEXT NOT NULL,
        destination_value TEXT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        UNIQUE KEY unique_language_key (language_code, key_hash),
        INDEX idx_language_values_key_hash (key_hash),
        INDEX idx_language_values_language_code (language_code),
        INDEX idx_language_values_original_key (original_key(255)),
        CONSTRAINT fk_language_values_language FOREIGN KEY (language_code)
          REFERENCES languages(code) ON DELETE CASCADE
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

    // Multi-Seller Marketplace Tables
    await this.createMultiSellerTables();

    await this.seedDefaults();
  }

  private async createMultiSellerTables(): Promise<void> {
    // Stores table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        logo_url VARCHAR(500),
        banner_url VARCHAR(500),
        status ENUM('pending', 'approved', 'suspended', 'rejected') DEFAULT 'pending',
        commission_rate DECIMAL(5,2) DEFAULT 10.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_stores_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_stores_user (user_id),
        INDEX idx_stores_slug (slug),
        INDEX idx_stores_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Store settings table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS store_settings (
        store_id INT PRIMARY KEY,
        currency VARCHAR(3) DEFAULT 'USD',
        timezone VARCHAR(50) DEFAULT 'UTC',
        auto_approve_products BOOLEAN DEFAULT FALSE,
        allow_custom_attributes BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_store_settings_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Parent orders table (for customer tracking)
    await this.execute(`
      CREATE TABLE IF NOT EXISTS parent_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_parent_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id),
        INDEX idx_parent_orders_customer (customer_id),
        INDEX idx_parent_orders_number (order_number),
        INDEX idx_parent_orders_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Store-specific orders table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS store_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        parent_order_id INT NOT NULL,
        customer_id INT NOT NULL,
        store_id INT NOT NULL,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_store_orders_parent FOREIGN KEY (parent_order_id) REFERENCES parent_orders(id) ON DELETE CASCADE,
        CONSTRAINT fk_store_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id),
        CONSTRAINT fk_store_orders_store FOREIGN KEY (store_id) REFERENCES stores(id),
        INDEX idx_store_orders_parent (parent_order_id),
        INDEX idx_store_orders_customer (customer_id),
        INDEX idx_store_orders_store (store_id),
        INDEX idx_store_orders_number (order_number),
        INDEX idx_store_orders_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Order items table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_order_items_store_order FOREIGN KEY (store_order_id) REFERENCES store_orders(id) ON DELETE CASCADE,
        CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
        INDEX idx_order_items_store_order (store_order_id),
        INDEX idx_order_items_product (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Commissions table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS commissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_item_id INT NOT NULL,
        store_id INT NOT NULL,
        commission_rate DECIMAL(5,2) NOT NULL,
        commission_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
        paid_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_commissions_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
        CONSTRAINT fk_commissions_store FOREIGN KEY (store_id) REFERENCES stores(id),
        INDEX idx_commissions_store (store_id),
        INDEX idx_commissions_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Shipments table
    await this.execute(`
      CREATE TABLE IF NOT EXISTS shipments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_order_id INT NOT NULL,
        tracking_number VARCHAR(100),
        carrier VARCHAR(50),
        status ENUM('preparing', 'shipped', 'delivered', 'cancelled') DEFAULT 'preparing',
        shipped_at TIMESTAMP NULL,
        delivered_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_shipments_store_order FOREIGN KEY (store_order_id) REFERENCES store_orders(id) ON DELETE CASCADE,
        INDEX idx_shipments_store_order (store_order_id),
        INDEX idx_shipments_tracking (tracking_number),
        INDEX idx_shipments_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Add store_id and seller_id to existing products table
    const [storeIdColumn] = await this.execute<RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'store_id'`,
      [this.config.database]
    );

    if (!storeIdColumn.length) {
      await this.execute("ALTER TABLE products ADD COLUMN store_id INT NULL");
      await this.execute("ALTER TABLE products ADD COLUMN seller_id INT NULL");

      try {
        await this.execute(
          "ALTER TABLE products ADD CONSTRAINT fk_products_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL"
        );
        await this.execute(
          "ALTER TABLE products ADD CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL"
        );
        await this.execute(
          "CREATE INDEX idx_products_store ON products(store_id)"
        );
        await this.execute(
          "CREATE INDEX idx_products_seller ON products(seller_id)"
        );
      } catch (e) {
        // Ignore if constraints already exist
      }
    }
  }

  private async seedDefaults(): Promise<void> {
    const [roleCountRows] = await this.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM roles"
    );
    const roleCount = Number(roleCountRows[0]?.count ?? 0);

    if (roleCount === 0) {
      const adminId = await this.insertRole("Admin", DEFAULT_ADMIN_PERMISSIONS);
      const userId = await this.insertRole("User", DEFAULT_USER_PERMISSIONS);
      const sellerId = await this.insertRole(
        "Seller",
        DEFAULT_SELLER_PERMISSIONS
      );
      this.logger.log(
        `Seeded default roles (Admin=${adminId}, User=${userId}, Seller=${sellerId})`
      );
    } else {
      // Ensure roles have default permissions; add any missing perms
      const [roles] = await this.execute<RowDataPacket[]>(
        "SELECT id, name FROM roles"
      );

      // Check for missing roles and create them
      const existingRoleNames = roles.map((role) => role.name.toLowerCase());
      const requiredRoles = [
        { name: "Admin", permissions: DEFAULT_ADMIN_PERMISSIONS },
        { name: "User", permissions: DEFAULT_USER_PERMISSIONS },
        { name: "Seller", permissions: DEFAULT_SELLER_PERMISSIONS },
      ];

      for (const requiredRole of requiredRoles) {
        if (!existingRoleNames.includes(requiredRole.name.toLowerCase())) {
          const roleId = await this.insertRole(
            requiredRole.name,
            requiredRole.permissions
          );
          this.logger.log(
            `Created missing role: ${requiredRole.name} (ID: ${roleId})`
          );
        }
      }

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
            : role.name.toLowerCase() === "seller"
            ? DEFAULT_SELLER_PERMISSIONS
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
    await this.seedMultiSellerData();
    await this.ensureSellerUsersHaveRoles();
  }

  private async ensureUsersHavePasswords(): Promise<void> {
    const [users] = await this.execute<RowDataPacket[]>(
      "SELECT id, email, password_hash FROM users"
    );
    for (const user of users) {
      if (!user.password_hash || user.email === "leanne@example.com") {
        const hash = this.passwordService.hashSync(DEFAULT_USER_PASSWORD);
        await this.execute("UPDATE users SET password_hash = ? WHERE id = ?", [
          hash,
          user.id,
        ]);
        if (user.email === "leanne@example.com") {
          this.logger.log(`Reset password for default user: ${user.email}`);
        }
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

  private async seedMultiSellerData(): Promise<void> {
    // Check if stores already exist
    const [storeCountRows] = await this.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM stores"
    );
    const storeCount = Number(storeCountRows[0]?.count ?? 0);

    // Check if orders already exist
    const [orderCountRows] = await this.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM store_orders"
    );
    const orderCount = Number(orderCountRows[0]?.count ?? 0);

    if (storeCount === 0 || orderCount === 0) {
      if (storeCount === 0) {
        this.logger.log("Seeding multi-seller data...");
      } else {
        this.logger.log(
          "Stores exist but orders missing, seeding orders and related data..."
        );
      }

      // Get seller role ID
      const [sellerRole] = await this.execute<RowDataPacket[]>(
        "SELECT id FROM roles WHERE name = 'Seller'"
      );
      const sellerRoleId = sellerRole[0]?.id;

      // Get admin user ID
      const [adminUser] = await this.execute<RowDataPacket[]>(
        "SELECT id FROM users WHERE email = 'tannpv@gmail.com'"
      );
      const adminUserId = adminUser[0]?.id;

      // Create sample seller users
      const sellerUsers = [
        {
          email: "seller1@example.com",
          firstName: "John",
          lastName: "Smith",
          password: "password123",
        },
        {
          email: "seller2@example.com",
          firstName: "Sarah",
          lastName: "Johnson",
          password: "password123",
        },
        {
          email: "seller3@example.com",
          firstName: "Mike",
          lastName: "Wilson",
          password: "password123",
        },
      ];

      const sellerUserIds = [];
      for (const seller of sellerUsers) {
        // Check if user already exists
        const [existingUser] = await this.execute<RowDataPacket[]>(
          "SELECT id FROM users WHERE email = ?",
          [seller.email]
        );

        let userId;
        if (existingUser.length > 0) {
          userId = existingUser[0].id;
          this.logger.log(
            `Seller user already exists: ${seller.email} (ID: ${userId})`
          );

          // Ensure seller role is assigned
          const [existingRole] = await this.execute<RowDataPacket[]>(
            "SELECT user_id FROM user_roles WHERE user_id = ? AND role_id = ?",
            [userId, sellerRoleId]
          );
          if (existingRole.length === 0) {
            await this.execute<ResultSetHeader>(
              `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
              [userId, sellerRoleId]
            );
            this.logger.log(
              `Assigned seller role to existing user: ${seller.email}`
            );
          }
        } else {
          const hashedPassword = await this.passwordService.hash(
            seller.password
          );
          const [result] = await this.execute<ResultSetHeader>(
            `INSERT INTO users (email, password_hash) VALUES (?, ?)`,
            [seller.email, hashedPassword]
          );
          userId = result.insertId;

          // Create user profile
          await this.execute<ResultSetHeader>(
            `INSERT INTO user_profiles (user_id, first_name, last_name, picture_url) VALUES (?, ?, ?, ?)`,
            [userId, seller.firstName, seller.lastName, null]
          );

          // Assign seller role
          await this.execute<ResultSetHeader>(
            `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
            [userId, sellerRoleId]
          );

          this.logger.log(
            `Created seller user: ${seller.email} (ID: ${userId})`
          );
        }

        sellerUserIds.push(userId);
      }

      // Create sample stores
      const stores = [
        {
          name: "Tech Gadgets Store",
          slug: "tech-gadgets-store",
          description:
            "Your one-stop shop for the latest technology gadgets and electronics.",
          logoUrl:
            "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop",
          bannerUrl:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=300&fit=crop",
          commissionRate: 8.5,
          status: "approved",
          userId: sellerUserIds[0],
        },
        {
          name: "Fashion Forward",
          slug: "fashion-forward",
          description:
            "Trendy fashion items for men and women. Stay stylish with our latest collection.",
          logoUrl:
            "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200&h=200&fit=crop",
          bannerUrl:
            "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=300&fit=crop",
          commissionRate: 12.0,
          status: "approved",
          userId: sellerUserIds[1],
        },
        {
          name: "Home & Garden",
          slug: "home-garden",
          description:
            "Everything you need to make your home beautiful and your garden flourish.",
          logoUrl:
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop",
          bannerUrl:
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=300&fit=crop",
          commissionRate: 10.0,
          status: "pending",
          userId: sellerUserIds[2],
        },
        {
          name: "Sports & Fitness",
          slug: "sports-fitness",
          description:
            "Premium sports equipment and fitness gear for athletes and fitness enthusiasts.",
          logoUrl:
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop",
          bannerUrl:
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=300&fit=crop",
          commissionRate: 9.5,
          status: "approved",
          userId: adminUserId, // Admin-owned store
        },
      ];

      const storeIds = [];

      // If stores already exist, get their IDs
      if (storeCount > 0) {
        const [existingStores] = await this.execute<RowDataPacket[]>(
          "SELECT id, slug FROM stores ORDER BY id"
        );
        storeIds.push(...existingStores.map((store) => store.id));
        this.logger.log(
          `Using existing stores: ${existingStores
            .map((s) => s.slug)
            .join(", ")}`
        );
      } else {
        // Create stores if they don't exist
        for (const store of stores) {
          // Check if store already exists
          const [existingStore] = await this.execute<RowDataPacket[]>(
            "SELECT id FROM stores WHERE slug = ?",
            [store.slug]
          );

          let storeId;
          if (existingStore.length > 0) {
            storeId = existingStore[0].id;
            this.logger.log(
              `Store already exists: ${store.name} (ID: ${storeId})`
            );
          } else {
            const [result] = await this.execute<ResultSetHeader>(
              `INSERT INTO stores (name, slug, description, logo_url, banner_url, commission_rate, status, user_id, created_at, updated_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                store.name,
                store.slug,
                store.description,
                store.logoUrl,
                store.bannerUrl,
                store.commissionRate,
                store.status,
                store.userId,
              ]
            );
            storeId = result.insertId;
            this.logger.log(`Created store: ${store.name} (ID: ${storeId})`);
          }
          storeIds.push(storeId);
        }
      }

      // Create sample products for stores
      const products = [
        {
          name: "Wireless Bluetooth Headphones",
          description:
            "High-quality wireless headphones with noise cancellation",
          sku: "TECH-HEADPHONES-001",
          storeId: storeIds[0], // Tech Gadgets Store
        },
        {
          name: "Smart Fitness Watch",
          description: "Advanced fitness tracking with heart rate monitor",
          sku: "TECH-WATCH-002",
          storeId: storeIds[0], // Tech Gadgets Store
        },
        {
          name: "Designer T-Shirt",
          description: "Premium cotton t-shirt with modern design",
          sku: "FASHION-TSHIRT-003",
          storeId: storeIds[1], // Fashion Forward
        },
        {
          name: "Garden Tool Set",
          description: "Complete set of professional garden tools",
          sku: "GARDEN-TOOLS-004",
          storeId: storeIds[2], // Home & Garden
        },
        {
          name: "Yoga Mat Pro",
          description: "Non-slip premium yoga mat for all fitness levels",
          sku: "SPORTS-YOGAMAT-005",
          storeId: storeIds[3], // Sports & Fitness
        },
      ];

      const productIds = [];
      for (const product of products) {
        // Check if product already exists by SKU
        const [existingProduct] = await this.execute<RowDataPacket[]>(
          "SELECT id FROM products WHERE sku = ?",
          [product.sku]
        );

        let productId;
        if (existingProduct.length > 0) {
          productId = existingProduct[0].id;
          this.logger.log(
            `Product already exists: ${product.name} (ID: ${productId})`
          );
        } else {
          const [result] = await this.execute<ResultSetHeader>(
            `INSERT INTO products (name, description, sku, store_id, seller_id, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              product.name,
              product.description,
              product.sku,
              product.storeId,
              sellerUserIds[product.storeId - 1] || sellerUserIds[0], // Use corresponding seller user ID
            ]
          );
          productId = result.insertId;
          this.logger.log(
            `Created product: ${product.name} (ID: ${productId})`
          );
        }
        productIds.push(productId);
      }

      // Create sample customer users
      const customers = [
        {
          email: "customer1@example.com",
          firstName: "Alice",
          lastName: "Johnson",
          password: "password123",
        },
        {
          email: "customer2@example.com",
          firstName: "Bob",
          lastName: "Smith",
          password: "password123",
        },
        {
          email: "customer3@example.com",
          firstName: "Carol",
          lastName: "Davis",
          password: "password123",
        },
        {
          email: "customer4@example.com",
          firstName: "David",
          lastName: "Wilson",
          password: "password123",
        },
      ];

      const customerIds = [];
      for (const customer of customers) {
        // Check if customer already exists
        const [existingCustomer] = await this.execute<RowDataPacket[]>(
          "SELECT id FROM users WHERE email = ?",
          [customer.email]
        );

        let customerId;
        if (existingCustomer.length > 0) {
          customerId = existingCustomer[0].id;
          this.logger.log(
            `Customer already exists: ${customer.email} (ID: ${customerId})`
          );
        } else {
          const hashedPassword = await this.passwordService.hash(
            customer.password
          );
          const [result] = await this.execute<ResultSetHeader>(
            `INSERT INTO users (email, password_hash) VALUES (?, ?)`,
            [customer.email, hashedPassword]
          );
          customerId = result.insertId;

          // Create user profile
          await this.execute<ResultSetHeader>(
            `INSERT INTO user_profiles (user_id, first_name, last_name, picture_url) VALUES (?, ?, ?, ?)`,
            [customerId, customer.firstName, customer.lastName, null]
          );

          this.logger.log(
            `Created customer: ${customer.email} (ID: ${customerId})`
          );
        }
        customerIds.push(customerId);
      }

      // Create sample orders
      const orders = [
        {
          orderNumber: "ORD-001",
          customerId: customerIds[0],
          totalAmount: 249.98,
          status: "completed",
          storeId: storeIds[0],
        },
        {
          orderNumber: "ORD-002",
          customerId: customerIds[1],
          totalAmount: 49.99,
          status: "processing",
          storeId: storeIds[1],
        },
        {
          orderNumber: "ORD-003",
          customerId: customerIds[2],
          totalAmount: 89.99,
          status: "pending",
          storeId: storeIds[2],
        },
        {
          orderNumber: "ORD-004",
          customerId: customerIds[3],
          totalAmount: 79.99,
          status: "completed",
          storeId: storeIds[3],
        },
      ];

      const orderIds = [];
      for (const order of orders) {
        // Create parent order
        const [parentResult] = await this.execute<ResultSetHeader>(
          `INSERT INTO parent_orders (order_number, customer_id, total_amount, status, created_at, updated_at) 
           VALUES (?, ?, ?, ?, NOW(), NOW())`,
          [order.orderNumber, order.customerId, order.totalAmount, order.status]
        );
        const parentOrderId = parentResult.insertId;

        // Create store order
        const [storeOrderResult] = await this.execute<ResultSetHeader>(
          `INSERT INTO store_orders (parent_order_id, store_id, customer_id, order_number, total_amount, status, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            parentOrderId,
            order.storeId,
            order.customerId,
            order.orderNumber,
            order.totalAmount,
            order.status,
          ]
        );
        orderIds.push(storeOrderResult.insertId);
        this.logger.log(
          `Created order: ${order.orderNumber} (ID: ${storeOrderResult.insertId})`
        );
      }

      // Create sample order items
      const orderItems = [
        {
          storeOrderId: orderIds[0],
          productId: productIds[0],
          quantity: 1,
          price: 199.99,
        },
        {
          storeOrderId: orderIds[0],
          productId: productIds[1],
          quantity: 1,
          price: 49.99,
        },
        {
          storeOrderId: orderIds[1],
          productId: productIds[2],
          quantity: 1,
          price: 49.99,
        },
        {
          storeOrderId: orderIds[2],
          productId: productIds[3],
          quantity: 1,
          price: 89.99,
        },
        {
          storeOrderId: orderIds[3],
          productId: productIds[4],
          quantity: 1,
          price: 79.99,
        },
      ];

      for (const item of orderItems) {
        await this.execute<ResultSetHeader>(
          `INSERT INTO order_items (store_order_id, product_id, quantity, price, created_at, updated_at) 
           VALUES (?, ?, ?, ?, NOW(), NOW())`,
          [item.storeOrderId, item.productId, item.quantity, item.price]
        );
      }

      // Create sample commissions
      for (let i = 0; i < orderIds.length; i++) {
        const orderId = orderIds[i];
        const storeId = stores[i].userId;
        const commissionRate = stores[i].commissionRate;
        const orderAmount = orders[i].totalAmount;
        const commissionAmount = (orderAmount * commissionRate) / 100;

        await this.execute<ResultSetHeader>(
          `INSERT INTO commissions (store_order_id, store_id, seller_id, amount, rate, status, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
          [orderId, storeId, storeId, commissionAmount, commissionRate]
        );
      }

      this.logger.log("Multi-seller data seeded successfully!");
      if (storeCount === 0) {
        this.logger.log(`Created ${sellerUsers.length} seller users`);
        this.logger.log(`Created ${stores.length} stores`);
        this.logger.log(`Created ${products.length} products`);
      }
      this.logger.log(`Created ${orders.length} orders`);
      this.logger.log(`Created ${orderItems.length} order items`);
      this.logger.log(`Created ${orderIds.length} commissions`);
    } else {
      this.logger.log("Multi-seller data already exists, skipping seeding");
    }
  }

  private async ensureSellerUsersHaveRoles(): Promise<void> {
    // Get seller role ID
    const [sellerRole] = await this.execute<RowDataPacket[]>(
      "SELECT id FROM roles WHERE name = 'Seller'"
    );

    if (sellerRole.length === 0) {
      this.logger.log(
        "Seller role not found, skipping seller user role assignment"
      );
      return;
    }

    const sellerRoleId = sellerRole[0].id;
    const sellerEmails = [
      "seller1@example.com",
      "seller2@example.com",
      "seller3@example.com",
    ];

    for (const email of sellerEmails) {
      // Get user ID
      const [user] = await this.execute<RowDataPacket[]>(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

      if (user.length === 0) {
        this.logger.log(`Seller user not found: ${email}`);
        continue;
      }

      const userId = user[0].id;

      // Check if user has seller role
      const [existingRole] = await this.execute<RowDataPacket[]>(
        "SELECT user_id FROM user_roles WHERE user_id = ? AND role_id = ?",
        [userId, sellerRoleId]
      );

      if (existingRole.length === 0) {
        // Assign seller role
        await this.execute<ResultSetHeader>(
          `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
          [userId, sellerRoleId]
        );
        this.logger.log(`Assigned seller role to user: ${email}`);
      }

      // Check if user has profile and update if needed
      const [profile] = await this.execute<RowDataPacket[]>(
        "SELECT user_id, first_name, last_name FROM user_profiles WHERE user_id = ?",
        [userId]
      );

      const firstName = email.includes("seller1")
        ? "John"
        : email.includes("seller2")
        ? "Sarah"
        : "Mike";
      const lastName = email.includes("seller1")
        ? "Smith"
        : email.includes("seller2")
        ? "Johnson"
        : "Wilson";

      if (profile.length === 0) {
        // Create user profile with default values
        await this.execute<ResultSetHeader>(
          `INSERT INTO user_profiles (user_id, first_name, last_name, picture_url) VALUES (?, ?, ?, ?)`,
          [userId, firstName, lastName, null]
        );
        this.logger.log(`Created profile for seller user: ${email}`);
      } else if (!profile[0].first_name || !profile[0].last_name) {
        // Update existing profile if names are missing
        await this.execute<ResultSetHeader>(
          `UPDATE user_profiles SET first_name = ?, last_name = ? WHERE user_id = ?`,
          [firstName, lastName, userId]
        );
        this.logger.log(`Updated profile for seller user: ${email}`);
      }
    }
  }
}
