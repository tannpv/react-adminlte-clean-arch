"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MysqlDatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlDatabaseService = void 0;
const common_1 = require("@nestjs/common");
const promise_1 = require("mysql2/promise");
const constants_1 = require("../../../shared/constants");
const password_service_1 = require("../../../shared/password.service");
let MysqlDatabaseService = MysqlDatabaseService_1 = class MysqlDatabaseService {
    constructor(passwordService) {
        this.passwordService = passwordService;
        this.logger = new common_1.Logger(MysqlDatabaseService_1.name);
        this.pool = null;
        const host = process.env.DB_HOST !== undefined ? process.env.DB_HOST : "localhost";
        const portRaw = process.env.DB_PORT !== undefined ? process.env.DB_PORT : "7777";
        const user = process.env.DB_USER !== undefined ? process.env.DB_USER : "root";
        const password = process.env.DB_PASSWORD !== undefined
            ? process.env.DB_PASSWORD
            : "password";
        const database = process.env.DB_NAME !== undefined ? process.env.DB_NAME : "adminlte";
        this.config = {
            host,
            port: Number(portRaw) || 7777,
            user,
            password,
            database,
        };
    }
    async onModuleInit() {
        await this.initialize();
    }
    async onModuleDestroy() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
    }
    getPool() {
        if (!this.pool) {
            throw new Error("MySQL pool not initialised");
        }
        return this.pool;
    }
    getDatabaseName() {
        return this.config.database;
    }
    async initialize() {
        const { host, port, user, password, database } = this.config;
        const connection = await (0, promise_1.createConnection)({ host, port, user, password });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await connection.end();
        this.pool = (0, promise_1.createPool)({
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
        this.logger.log(`Connected to MySQL database ${database} on ${host}:${port}`);
    }
    async runMigrations() {
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
        const [productTypeColumn] = await this.execute(`SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'type'`, [this.config.database]);
        if (!productTypeColumn.length) {
            await this.execute("ALTER TABLE products ADD COLUMN type VARCHAR(32) NOT NULL DEFAULT 'simple' AFTER status");
            await this.execute("UPDATE products SET type = 'simple' WHERE type IS NULL OR type = ''");
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
        await this.execute(`
      CREATE TABLE IF NOT EXISTS product_attribute_values (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        attribute_id BIGINT UNSIGNED NOT NULL,
        value_text TEXT NULL,
        value_number DECIMAL(15,4) NULL,
        value_boolean BOOLEAN NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_pav_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        CONSTRAINT fk_pav_attribute FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE,
        UNIQUE KEY ux_product_attribute (product_id, attribute_id),
        KEY ix_pav_product (product_id),
        KEY ix_pav_attribute (attribute_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
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
        const [categoryParentColumn] = await this.execute(`SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'parent_id'`, [this.config.database]);
        if (!categoryParentColumn.length) {
            await this.execute("ALTER TABLE categories ADD COLUMN parent_id INT NULL");
        }
        try {
            await this.execute("CREATE INDEX idx_categories_parent ON categories(parent_id)");
        }
        catch (e) {
        }
        try {
            await this.execute(`
        ALTER TABLE categories
        ADD CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id)
          REFERENCES categories(id) ON DELETE SET NULL
      `);
        }
        catch (e) {
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
            await this.execute("ALTER TABLE user_profiles MODIFY COLUMN picture_url LONGTEXT NULL");
        }
        catch (e) {
        }
        const [nameColumnRows] = await this.execute(`SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'name'`, [this.config.database]);
        if (nameColumnRows.length) {
            await this.execute(`INSERT INTO user_profiles (user_id, first_name, last_name)
         SELECT u.id,
                COALESCE(NULLIF(TRIM(SUBSTRING_INDEX(u.name, ' ', 1)), ''), 'User'),
                COALESCE(NULLIF(TRIM(SUBSTRING_INDEX(u.name, ' ', -1)), ''), 'User')
         FROM users u
         WHERE NOT EXISTS (
           SELECT 1 FROM user_profiles p WHERE p.user_id = u.id
         );`);
            try {
                await this.execute("ALTER TABLE users DROP COLUMN name");
            }
            catch (e) {
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
        await this.seedDefaults();
    }
    async seedDefaults() {
        const [roleCountRows] = await this.execute("SELECT COUNT(*) as count FROM roles");
        const roleCount = Number(roleCountRows[0]?.count ?? 0);
        if (roleCount === 0) {
            const adminId = await this.insertRole("Admin", constants_1.DEFAULT_ADMIN_PERMISSIONS);
            const userId = await this.insertRole("User", constants_1.DEFAULT_USER_PERMISSIONS);
            this.logger.log(`Seeded default roles (Admin=${adminId}, User=${userId})`);
        }
        else {
            const [roles] = await this.execute("SELECT id, name FROM roles");
            for (const role of roles) {
                const [existingPermissions] = await this.execute("SELECT permission FROM role_permissions WHERE role_id = ?", [role.id]);
                const existingSet = new Set(existingPermissions.map((row) => row.permission));
                const desired = role.name.toLowerCase() === "admin"
                    ? constants_1.DEFAULT_ADMIN_PERMISSIONS
                    : role.name.toLowerCase() === "user"
                        ? constants_1.DEFAULT_USER_PERMISSIONS
                        : ["users:read"];
                const missing = desired.filter((perm) => !existingSet.has(perm));
                if (missing.length) {
                    await this.insertPermissions(role.id, missing);
                }
            }
        }
        const [userCountRows] = await this.execute("SELECT COUNT(*) as count FROM users");
        const userCount = Number(userCountRows[0]?.count ?? 0);
        if (userCount === 0) {
            const passwordHash = this.passwordService.hashSync(constants_1.DEFAULT_USER_PASSWORD);
            const [result] = await this.execute("INSERT INTO users (email, password_hash) VALUES (?, ?)", ["leanne@example.com", passwordHash]);
            const userId = result.insertId;
            await this.execute("INSERT INTO user_profiles (user_id, first_name, last_name, picture_url) VALUES (?, ?, ?, ?)", [userId, "Leanne", "Graham", null]);
            const [adminRoles] = await this.execute("SELECT id FROM roles WHERE LOWER(name) = 'admin' LIMIT 1");
            const adminRoleId = adminRoles[0]?.id;
            if (adminRoleId) {
                await this.execute("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [userId, adminRoleId]);
            }
            this.logger.log(`Seeded default admin user (ID=${userId})`);
        }
        else {
            await this.ensureUsersHavePasswords();
        }
        await this.ensureDefaultCategories();
        await this.ensureSampleProduct();
        await this.seedDefaultAttributes();
    }
    async ensureUsersHavePasswords() {
        const [users] = await this.execute("SELECT id, password_hash FROM users");
        for (const user of users) {
            if (!user.password_hash) {
                const hash = this.passwordService.hashSync(constants_1.DEFAULT_USER_PASSWORD);
                await this.execute("UPDATE users SET password_hash = ? WHERE id = ?", [
                    hash,
                    user.id,
                ]);
            }
        }
    }
    async insertRole(name, permissions) {
        const [result] = await this.execute("INSERT INTO roles (name) VALUES (?)", [name]);
        const roleId = result.insertId;
        await this.insertPermissions(roleId, permissions);
        return roleId;
    }
    async ensureSampleProduct() {
        const [countRows] = await this.execute("SELECT COUNT(*) as count FROM products");
        const count = Number(countRows[0]?.count ?? 0);
        if (count > 0)
            return;
        const now = new Date();
        const [result] = await this.execute(`INSERT INTO products (sku, name, description, price_cents, currency, status, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            "SKU-001",
            "Sample Product",
            "This is a placeholder product seeded for local development.",
            1999,
            "USD",
            "published",
            JSON.stringify({ tags: ["sample"] }),
            now,
            now,
        ]);
        const productId = result.insertId;
        const [category] = await this.execute("SELECT id FROM categories ORDER BY id ASC LIMIT 1");
        const categoryId = category[0]?.id;
        if (categoryId) {
            await this.execute("INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)", [productId, categoryId]);
        }
        this.logger.log("Seeded sample product (SKU=SKU-001)");
    }
    async ensureDefaultCategories() {
        const [countRows] = await this.execute("SELECT COUNT(*) as count FROM categories");
        const count = Number(countRows[0]?.count ?? 0);
        if (count > 0)
            return;
        const defaults = ["Electronics", "Apparel", "Books"];
        const placeholders = defaults.map(() => "(?)").join(", ");
        await this.execute(`INSERT INTO categories (name) VALUES ${placeholders}`, defaults);
        this.logger.log("Seeded default categories");
    }
    async seedDefaultAttributes() {
        const [attributeCountRows] = await this.execute("SELECT COUNT(*) as count FROM attributes");
        const attributeCount = Number(attributeCountRows[0]?.count ?? 0);
        if (attributeCount > 0)
            return;
        const now = new Date();
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
        const attributeIds = {};
        for (const attr of defaultAttributes) {
            const [attrResult] = await this.execute(`INSERT INTO attributes (code, name, input_type, data_type, unit, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                attr.code,
                attr.name,
                attr.input_type,
                attr.data_type,
                attr.unit || null,
                now,
                now,
            ]);
            attributeIds[attr.code] = attrResult.insertId;
        }
        const defaultValues = [
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
            { attribute_code: "size", value_code: "xs", label: "XS", sort_order: 1 },
            { attribute_code: "size", value_code: "s", label: "S", sort_order: 2 },
            { attribute_code: "size", value_code: "m", label: "M", sort_order: 3 },
            { attribute_code: "size", value_code: "l", label: "L", sort_order: 4 },
            { attribute_code: "size", value_code: "xl", label: "XL", sort_order: 5 },
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
            await this.execute(`INSERT INTO attribute_values (attribute_id, value_code, label, sort_order) 
         VALUES (?, ?, ?, ?)`, [
                attributeIds[value.attribute_code],
                value.value_code,
                value.label,
                value.sort_order,
            ]);
        }
        const defaultSets = [
            { name: "Clothing", description: "Standard clothing attributes" },
            { name: "Electronics", description: "Standard electronics attributes" },
            { name: "Books", description: "Standard book attributes" },
        ];
        const setIds = {};
        for (const set of defaultSets) {
            const [setResult] = await this.execute(`INSERT INTO attribute_sets (name, description, is_system, sort_order, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?)`, [set.name, set.description, true, 0, now, now]);
            setIds[set.name] = setResult.insertId;
        }
        const setAssignments = [
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
            await this.execute(`INSERT INTO attribute_set_assignments (attribute_set_id, attribute_id, sort_order, is_required, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?)`, [
                setIds[assignment.set_name],
                attributeIds[assignment.attribute_code],
                assignment.sort_order,
                assignment.is_required,
                now,
                now,
            ]);
        }
        this.logger.log("Seeded default attributes, attribute values, and attribute sets");
    }
    async insertPermissions(roleId, permissions) {
        if (!permissions.length)
            return;
        const placeholders = permissions.map(() => "(?, ?)").join(", ");
        const params = permissions.flatMap((perm) => [roleId, perm]);
        await this.execute(`INSERT IGNORE INTO role_permissions (role_id, permission) VALUES ${placeholders}`, params);
    }
    async execute(sql, params) {
        const pool = this.getPool();
        return pool.query(sql, params);
    }
};
exports.MysqlDatabaseService = MysqlDatabaseService;
exports.MysqlDatabaseService = MysqlDatabaseService = MysqlDatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [password_service_1.PasswordService])
], MysqlDatabaseService);
//# sourceMappingURL=mysql-database.service.js.map