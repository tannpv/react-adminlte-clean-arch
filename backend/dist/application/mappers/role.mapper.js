"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toRoleResponse = toRoleResponse;
function toRoleResponse(role) {
    return {
        id: role.id,
        name: role.name,
        permissions: [...role.permissions],
    };
}
//# sourceMappingURL=role.mapper.js.map