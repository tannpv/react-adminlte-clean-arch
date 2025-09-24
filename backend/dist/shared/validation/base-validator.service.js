"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseValidatorService = void 0;
const common_1 = require("@nestjs/common");
let BaseValidatorService = class BaseValidatorService {
    createError(field, code, message) {
        return { code, message };
    }
    createSuccess() {
        return { isValid: true, errors: {} };
    }
    createFailure(errors) {
        return { isValid: false, errors };
    }
    validateRequiredString(value, fieldName, minLength = 2) {
        const trimmed = value?.trim();
        if (!trimmed || trimmed.length < minLength) {
            return this.createError(fieldName, `${fieldName.toUpperCase()}_MIN`, `${fieldName} is required (min ${minLength} characters)`);
        }
        return null;
    }
    validateEmail(email) {
        const trimmed = email?.trim();
        if (!trimmed) {
            return this.createError('email', 'EMAIL_REQUIRED', 'Email is required');
        }
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(trimmed)) {
            return this.createError('email', 'EMAIL_INVALID', 'Email is invalid');
        }
        return null;
    }
    validatePassword(password) {
        if (!password?.trim()) {
            return this.createError('password', 'PASSWORD_REQUIRED', 'Password is required');
        }
        if (password.length < 6) {
            return this.createError('password', 'PASSWORD_MIN', 'Password must be at least 6 characters');
        }
        return null;
    }
    validateDate(dateString, fieldName) {
        if (!dateString)
            return null;
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            return this.createError(fieldName, `${fieldName.toUpperCase()}_INVALID`, `${fieldName} must be a valid date`);
        }
        return null;
    }
    validateOptionalString(value, fieldName, minLength = 2) {
        if (value === undefined)
            return null;
        const trimmed = value?.trim();
        if (trimmed && trimmed.length < minLength) {
            return this.createError(fieldName, `${fieldName.toUpperCase()}_MIN`, `${fieldName} must be at least ${minLength} characters`);
        }
        return null;
    }
};
exports.BaseValidatorService = BaseValidatorService;
exports.BaseValidatorService = BaseValidatorService = __decorate([
    (0, common_1.Injectable)()
], BaseValidatorService);
//# sourceMappingURL=base-validator.service.js.map