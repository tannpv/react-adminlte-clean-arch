"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserResponse = toUserResponse;
function toUserResponse(user) {
    const publicUser = user.toPublic();
    return {
        id: publicUser.id,
        email: publicUser.email,
        roles: [...publicUser.roles],
        profile: publicUser.profile ? { ...publicUser.profile } : null,
    };
}
//# sourceMappingURL=user.mapper.js.map