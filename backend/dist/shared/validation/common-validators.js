"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonValidators = void 0;
class CommonValidators {
    static validateEmail(email) {
        const trimmed = email?.trim();
        if (!trimmed) {
            return { code: "EMAIL_REQUIRED", message: "Email is required" };
        }
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(trimmed)) {
            return { code: "EMAIL_INVALID", message: "Email is invalid" };
        }
        return null;
    }
    static validatePassword(password) {
        if (!password?.trim()) {
            return { code: "PASSWORD_REQUIRED", message: "Password is required" };
        }
        if (password.length < 6) {
            return {
                code: "PASSWORD_MIN",
                message: "Password must be at least 6 characters",
            };
        }
        return null;
    }
    static validateRequiredString(value, fieldName, minLength = 2) {
        const trimmed = value?.trim();
        if (!trimmed || trimmed.length < minLength) {
            return {
                code: `${fieldName.toUpperCase()}_MIN`,
                message: `${fieldName} is required (min ${minLength} characters)`,
            };
        }
        return null;
    }
    static validateOptionalString(value, fieldName, minLength = 2) {
        if (value === undefined)
            return null;
        const trimmed = value?.trim();
        if (trimmed && trimmed.length < minLength) {
            return {
                code: `${fieldName.toUpperCase()}_MIN`,
                message: `${fieldName} must be at least ${minLength} characters`,
            };
        }
        return null;
    }
    static validateDate(dateString, fieldName) {
        if (!dateString)
            return null;
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            return {
                code: `${fieldName.toUpperCase()}_INVALID`,
                message: `${fieldName} must be a valid date`,
            };
        }
        return null;
    }
    static validatePositiveNumber(value, fieldName) {
        if (value === undefined)
            return null;
        if (typeof value !== "number" || Number.isNaN(value)) {
            return {
                code: `${fieldName.toUpperCase()}_INVALID`,
                message: `${fieldName} must be a valid number`,
            };
        }
        if (value <= 0) {
            return {
                code: `${fieldName.toUpperCase()}_POSITIVE`,
                message: `${fieldName} must be positive`,
            };
        }
        return null;
    }
    static validateArray(value, fieldName, minLength = 0) {
        if (value === undefined)
            return null;
        if (!Array.isArray(value)) {
            return {
                code: `${fieldName.toUpperCase()}_INVALID`,
                message: `${fieldName} must be an array`,
            };
        }
        if (value.length < minLength) {
            return {
                code: `${fieldName.toUpperCase()}_MIN_LENGTH`,
                message: `${fieldName} must have at least ${minLength} items`,
            };
        }
        return null;
    }
    static validateIntegerArray(value, fieldName) {
        const arrayError = this.validateArray(value, fieldName);
        if (arrayError)
            return arrayError;
        if (value === undefined)
            return null;
        const invalidItems = value.filter((item) => !Number.isInteger(item));
        if (invalidItems.length > 0) {
            return {
                code: `${fieldName.toUpperCase()}_INVALID_ITEMS`,
                message: `${fieldName} must contain only integers`,
            };
        }
        return null;
    }
}
exports.CommonValidators = CommonValidators;
//# sourceMappingURL=common-validators.js.map