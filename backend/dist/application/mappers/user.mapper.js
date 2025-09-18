"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserResponse = toUserResponse;
function toUserResponse(user) {
    const publicUser = user.toPublic();
    return {
        id: publicUser.id,
        name: publicUser.name,
        email: publicUser.email,
        roles: [...publicUser.roles],
    };
}
//# sourceMappingURL=user.mapper.js.map