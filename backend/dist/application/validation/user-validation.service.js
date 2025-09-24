"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidationService = void 0;
const common_1 = require("@nestjs/common");
const role_repository_1 = require("../../domain/repositories/role.repository");
const user_repository_1 = require("../../domain/repositories/user.repository");
const base_validator_service_1 = require("../../shared/validation/base-validator.service");
const common_validators_1 = require("../../shared/validation/common-validators");
let UserValidationService = class UserValidationService extends base_validator_service_1.BaseValidatorService {
    constructor(users, roles) {
        super();
        this.users = users;
        this.roles = roles;
    }
    async validate(data) {
        const errors = {};
        const firstNameError = this.validateFirstName(data.firstName);
        if (firstNameError)
            errors.firstName = firstNameError;
        const lastNameError = this.validateLastName(data.lastName);
        if (lastNameError)
            errors.lastName = lastNameError;
        const emailError = await this.validateEmailUniqueness(data.email);
        if (emailError)
            errors.email = emailError;
        const rolesError = await this.validateRoles(data.roles);
        if (rolesError)
            errors.roles = rolesError;
        const dobError = this.validateDateOfBirth(data.dateOfBirth);
        if (dobError)
            errors.dateOfBirth = dobError;
        const pictureUrlError = this.validatePictureUrl(data.pictureUrl);
        if (pictureUrlError)
            errors.pictureUrl = pictureUrlError;
        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }
    validateFirstName(firstName) {
        return common_validators_1.CommonValidators.validateRequiredString(firstName, "firstName", 2);
    }
    validateLastName(lastName) {
        return common_validators_1.CommonValidators.validateRequiredString(lastName, "lastName", 2);
    }
    async validateEmailUniqueness(email) {
        const basicError = common_validators_1.CommonValidators.validateEmail(email);
        if (basicError)
            return basicError;
        const trimmedEmail = email.trim().toLowerCase();
        const existing = await this.users.findByEmail(trimmedEmail);
        if (existing) {
            return this.createError("email", "EMAIL_EXISTS", "Email is already in use");
        }
        return null;
    }
    async validateRoles(roles) {
        if (!roles || !Array.isArray(roles))
            return null;
        const arrayError = common_validators_1.CommonValidators.validateIntegerArray(roles, "roles");
        if (arrayError)
            return arrayError;
        const found = await this.roles.findByIds(roles);
        const foundIds = new Set(found.map((role) => role.id));
        const missing = roles.filter((roleId) => !foundIds.has(roleId));
        if (missing.length > 0) {
            return this.createError("roles", "ROLES_INVALID", "Invalid roles selected");
        }
        return null;
    }
    validateDateOfBirth(dateOfBirth) {
        return common_validators_1.CommonValidators.validateDate(dateOfBirth, "dateOfBirth");
    }
    validatePictureUrl(pictureUrl) {
        if (pictureUrl === undefined)
            return null;
        const trimmed = pictureUrl?.trim();
        if (trimmed && trimmed.length > 0) {
            try {
                new URL(trimmed);
            }
            catch {
                return this.createError("pictureUrl", "PICTURE_URL_INVALID", "Picture URL must be a valid URL");
            }
        }
        return null;
    }
};
exports.UserValidationService = UserValidationService;
exports.UserValidationService = UserValidationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(role_repository_1.ROLE_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], UserValidationService);
//# sourceMappingURL=user-validation.service.js.map