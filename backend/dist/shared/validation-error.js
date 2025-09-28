"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationException = validationException;
const common_1 = require("@nestjs/common");
function validationException(fieldErrors) {
    const details = {};
    const simple = {};
    for (const [field, value] of Object.entries(fieldErrors)) {
        if (typeof value === 'string') {
            const detail = { code: 'VALIDATION_ERROR', message: value };
            details[field] = detail;
            simple[field] = value;
        }
        else {
            details[field] = value;
            simple[field] = value.message;
        }
    }
    return new common_1.BadRequestException({
        message: 'Validation failed',
        errors: simple,
        error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: {
                fieldErrors: details,
            },
        },
    });
}
//# sourceMappingURL=validation-error.js.map