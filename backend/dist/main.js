"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const validation_error_1 = require("./shared/validation-error");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: (validationErrors = []) => {
            const fieldErrors = {};
            validationErrors.forEach((error) => {
                if (error.constraints) {
                    const messages = Object.values(error.constraints);
                    if (messages.length) {
                        fieldErrors[error.property] = { code: 'VALIDATION_ERROR', message: messages[0] };
                    }
                }
            });
            if (Object.keys(fieldErrors).length === 0) {
                return new common_1.BadRequestException({ message: 'Validation failed' });
            }
            return (0, validation_error_1.validationException)(fieldErrors);
        },
    }));
    const port = Number(process.env.PORT) || 3001;
    await app.listen(port);
    console.log(`API server listening on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map