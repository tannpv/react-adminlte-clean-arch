import { Permission } from "../domain/value-objects/permission.type";

export const DEFAULT_ADMIN_PERMISSIONS: Permission[] = [
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
  "attributes:read",
  "attributes:create",
  "attributes:update",
  "attributes:delete",
  "attribute-values:read",
  "attribute-values:create",
  "attribute-values:update",
  "attribute-values:delete",
  "attribute-sets:read",
  "attribute-sets:create",
  "attribute-sets:update",
  "attribute-sets:delete",
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

export const DEFAULT_USER_PERMISSIONS: Permission[] = [
  "users:read",
  "products:read",
  "categories:read",
  "attributes:read",
  "attribute-values:read",
  "attribute-sets:read",
  "storage:read",
  "translations:read",
];

export const DEFAULT_TRANSLATOR_PERMISSIONS: Permission[] = [
  "translations:read",
  "translations:create",
  "translations:update",
  "translations:delete",
  "translations:manage",
];

export const DEFAULT_JWT_SECRET = "dev_secret_change_me";

export const DEFAULT_USER_PASSWORD = "secret";
