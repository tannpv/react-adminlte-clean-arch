"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, name, email, roles, passwordHash) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.roles = roles;
        this.passwordHash = passwordHash;
    }
    toPublic() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            roles: [...this.roles],
        };
    }
    clone() {
        return new User(this.id, this.name, this.email, [...this.roles], this.passwordHash);
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map