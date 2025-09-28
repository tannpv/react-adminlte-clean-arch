"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfile = void 0;
class UserProfile {
    constructor(props) {
        this.props = props;
    }
    get userId() { return this.props.userId; }
    get firstName() { return this.props.firstName; }
    set firstName(value) { this.props.firstName = value; }
    get lastName() { return this.props.lastName; }
    set lastName(value) { this.props.lastName = value ?? null; }
    get dateOfBirth() { return this.props.dateOfBirth; }
    set dateOfBirth(value) { this.props.dateOfBirth = value ?? null; }
    get pictureUrl() { return this.props.pictureUrl; }
    set pictureUrl(value) { this.props.pictureUrl = value ?? null; }
    clone() {
        return new UserProfile({ ...this.props });
    }
}
exports.UserProfile = UserProfile;
//# sourceMappingURL=user-profile.entity.js.map