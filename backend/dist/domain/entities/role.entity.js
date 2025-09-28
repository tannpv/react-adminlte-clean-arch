"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
class Role {
    constructor(id, name, permissions = []) {
        this.id = id;
        this.name = name;
        this.permissions = permissions;
    }
    clone() {
        return new Role(this.id, this.name, [...this.permissions]);
    }
}
exports.Role = Role;
//# sourceMappingURL=role.entity.js.map