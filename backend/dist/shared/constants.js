"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_USER_PASSWORD = exports.DEFAULT_JWT_SECRET = exports.DEFAULT_TRANSLATOR_PERMISSIONS = exports.DEFAULT_USER_PERMISSIONS = exports.DEFAULT_ADMIN_PERMISSIONS = void 0;
exports.DEFAULT_ADMIN_PERMISSIONS = [
    "users:read",
    "users:create",
    "users:update",
    "users:delete",
    "roles:read",
    "roles:create",
    "roles:update",
    "roles:delete",
    "products:read",
    "products:create",
    "products:update",
    "products:delete",
    "categories:read",
    "categories:create",
    "categories:update",
    "categories:delete",
    "storage:read",
    "storage:create",
    "storage:update",
    "storage:delete",
    "translations:read",
    "translations:create",
    "translations:update",
    "translations:delete",
    "translations:manage",
];
exports.DEFAULT_USER_PERMISSIONS = [
    "users:read",
    "products:read",
    "categories:read",
    "storage:read",
    "translations:read",
];
exports.DEFAULT_TRANSLATOR_PERMISSIONS = [
    "translations:read",
    "translations:create",
    "translations:update",
    "translations:delete",
    "translations:manage",
];
exports.DEFAULT_JWT_SECRET = "dev_secret_change_me";
exports.DEFAULT_USER_PASSWORD = "secret";
//# sourceMappingURL=constants.js.map