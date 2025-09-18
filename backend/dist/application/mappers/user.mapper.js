"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserResponse = toUserResponse;
const user_entity_1 = require("../../domain/entities/user.entity");
function toUserResponse(user) {
    const source = user instanceof user_entity_1.User ? user.toPublic() : user;
    return {
        id: source.id,
        name: source.name,
        email: source.email,
        roles: [...source.roles],
    };
}
//# sourceMappingURL=user.mapper.js.map