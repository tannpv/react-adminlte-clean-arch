"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileGrant = void 0;
class FileGrant {
    constructor(id, entityType, entityId, roleId, access) {
        this.id = id;
        this.entityType = entityType;
        this.entityId = entityId;
        this.roleId = roleId;
        this.access = access;
    }
    clone() {
        return new FileGrant(this.id, this.entityType, this.entityId, this.roleId, this.access);
    }
}
exports.FileGrant = FileGrant;
//# sourceMappingURL=file-grant.entity.js.map