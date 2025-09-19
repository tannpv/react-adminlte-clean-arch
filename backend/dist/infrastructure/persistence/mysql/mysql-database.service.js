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
const password_service_1 = require("../../../shared/password.service");
const constants_1 = require("../../../shared/constants");
let MysqlDatabaseService = MysqlDatabaseService_1 = class MysqlDatabaseService {
    constructor(passwordService) {
        this.passwordService = passwordService;
        this.logger = new common_1.Logger(MysqlDatabaseService_1.name);
        this.pool = null;
        const host = process.env.DB_HOST !== undefined ? process.env.DB_HOST : 'localhost';
        const portRaw = process.env.DB_PORT !== undefined ? process.env.DB_PORT : '7777';
        const user = process.env.DB_USER !== undefined ? process.env.DB_USER : 'root';
        const password = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'password';
        const database = process.env.DB_NAME !== undefined ? process.env.DB_NAME : 'adminlte';
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
            throw new Error('MySQL pool not initialised');
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
        metadata JSON NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        INDEX idx_products_status (status),
        INDEX idx_products_updated_at (updated_at)
      ) ENGINE=InnoDB;
    `);
        await this.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      ) ENGINE=InnoDB;
    `);
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
        picture_url VARCHAR(1024) NULL,
        CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
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
                await this.execute('ALTER TABLE users DROP COLUMN name');
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
        await this.seedDefaults();
    }
    async seedDefaults() {
        const [roleCountRows] = await this.execute('SELECT COUNT(*) as count FROM roles');
        const roleCount = Number(roleCountRows[0]?.count ?? 0);
        if (roleCount === 0) {
            const adminId = await this.insertRole('Admin', constants_1.DEFAULT_ADMIN_PERMISSIONS);
            const userId = await this.insertRole('User', constants_1.DEFAULT_USER_PERMISSIONS);
            this.logger.log(`Seeded default roles (Admin=${adminId}, User=${userId})`);
        }
        else {
            const [roles] = await this.execute('SELECT id, name FROM roles');
            for (const role of roles) {
                const [existingPermissions] = await this.execute('SELECT permission FROM role_permissions WHERE role_id = ?', [role.id]);
                const existingSet = new Set(existingPermissions.map((row) => row.permission));
                const desired = role.name.toLowerCase() === 'admin'
                    ? constants_1.DEFAULT_ADMIN_PERMISSIONS
                    : role.name.toLowerCase() === 'user'
                        ? constants_1.DEFAULT_USER_PERMISSIONS
                        : ['users:read'];
                const missing = desired.filter((perm) => !existingSet.has(perm));
                if (missing.length) {
                    await this.insertPermissions(role.id, missing);
                }
            }
        }
        const [userCountRows] = await this.execute('SELECT COUNT(*) as count FROM users');
        const userCount = Number(userCountRows[0]?.count ?? 0);
        if (userCount === 0) {
            const passwordHash = this.passwordService.hashSync(constants_1.DEFAULT_USER_PASSWORD);
            const [result] = await this.execute('INSERT INTO users (email, password_hash) VALUES (?, ?)', ['leanne@example.com', passwordHash]);
            const userId = result.insertId;
            await this.execute('INSERT INTO user_profiles (user_id, first_name, last_name, picture_url) VALUES (?, ?, ?, ?)', [userId, 'Leanne', 'Graham', null]);
            const [adminRoles] = await this.execute("SELECT id FROM roles WHERE LOWER(name) = 'admin' LIMIT 1");
            const adminRoleId = adminRoles[0]?.id;
            if (adminRoleId) {
                await this.execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, adminRoleId]);
            }
            this.logger.log(`Seeded default admin user (ID=${userId})`);
        }
        else {
            await this.ensureUsersHavePasswords();
        }
        await this.ensureDefaultCategories();
        await this.ensureSampleProduct();
    }
    async ensureUsersHavePasswords() {
        const [users] = await this.execute('SELECT id, password_hash FROM users');
        for (const user of users) {
            if (!user.password_hash) {
                const hash = this.passwordService.hashSync(constants_1.DEFAULT_USER_PASSWORD);
                await this.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user.id]);
            }
        }
    }
    async insertRole(name, permissions) {
        const [result] = await this.execute('INSERT INTO roles (name) VALUES (?)', [name]);
        const roleId = result.insertId;
        await this.insertPermissions(roleId, permissions);
        return roleId;
    }
    async ensureSampleProduct() {
        const [countRows] = await this.execute('SELECT COUNT(*) as count FROM products');
        const count = Number(countRows[0]?.count ?? 0);
        if (count > 0)
            return;
        const now = new Date();
        const [result] = await this.execute(`INSERT INTO products (sku, name, description, price_cents, currency, status, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            'SKU-001',
            'Sample Product',
            'This is a placeholder product seeded for local development.',
            1999,
            'USD',
            'published',
            JSON.stringify({ tags: ['sample'] }),
            now,
            now,
        ]);
        const productId = result.insertId;
        const [category] = await this.execute('SELECT id FROM categories ORDER BY id ASC LIMIT 1');
        const categoryId = category[0]?.id;
        if (categoryId) {
            await this.execute('INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)', [productId, categoryId]);
        }
        this.logger.log('Seeded sample product (SKU=SKU-001)');
    }
    async ensureDefaultCategories() {
        const [countRows] = await this.execute('SELECT COUNT(*) as count FROM categories');
        const count = Number(countRows[0]?.count ?? 0);
        if (count > 0)
            return;
        const defaults = ['Electronics', 'Apparel', 'Books'];
        const placeholders = defaults.map(() => '(?)').join(', ');
        await this.execute(`INSERT INTO categories (name) VALUES ${placeholders}`, defaults);
        this.logger.log('Seeded default categories');
    }
    async insertPermissions(roleId, permissions) {
        if (!permissions.length)
            return;
        const placeholders = permissions.map(() => '(?, ?)').join(', ');
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