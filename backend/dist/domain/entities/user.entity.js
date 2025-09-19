"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, email, roles, passwordHash, _profile = null) {
        this.id = id;
        this.email = email;
        this.roles = roles;
        this.passwordHash = passwordHash;
        this._profile = _profile;
    }
    get profile() {
        return this._profile ? this._profile.clone() : null;
    }
    set profile(profile) {
        this._profile = profile ? profile.clone() : null;
    }
    toPublic() {
        return {
            id: this.id,
            email: this.email,
            roles: [...this.roles],
            profile: this._profile
                ? {
                    firstName: this._profile.firstName,
                    lastName: this._profile.lastName,
                    dateOfBirth: this._profile.dateOfBirth ? this._profile.dateOfBirth.toISOString().split('T')[0] : null,
                    pictureUrl: this._profile.pictureUrl,
                }
                : null,
        };
    }
    clone() {
        return new User(this.id, this.email, [...this.roles], this.passwordHash, this._profile ? this._profile.clone() : null);
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map