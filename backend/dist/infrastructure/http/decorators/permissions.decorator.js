"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireAnyPermission = exports.RequirePermissions = exports.PERMISSIONS_METADATA_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMISSIONS_METADATA_KEY = 'permissions';
const RequirePermissions = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_METADATA_KEY, { all: permissions });
exports.RequirePermissions = RequirePermissions;
const RequireAnyPermission = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_METADATA_KEY, { any: permissions });
exports.RequireAnyPermission = RequireAnyPermission;
//# sourceMappingURL=permissions.decorator.js.map