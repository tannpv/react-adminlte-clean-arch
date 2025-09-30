import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as bodyParser from "body-parser";
import { ValidationError } from "class-validator";
import * as express from "express";
import * as path from "path";
import { AppModule } from "./app.module";
import { validationException } from "./shared/validation-error";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      "http://localhost:5177",
      "http://localhost:5178",
      "http://localhost:5179",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  });

  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
  const uploadRoot = process.env.FILE_STORAGE_ROOT
    ? path.resolve(process.env.FILE_STORAGE_ROOT)
    : path.resolve(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadRoot));
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const fieldErrors: Record<string, { code: string; message: string }> =
          {};
        validationErrors.forEach((error) => {
          if (error.constraints) {
            const messages = Object.values(error.constraints);
            if (messages.length) {
              fieldErrors[error.property] = {
                code: "VALIDATION_ERROR",
                message: messages[0],
              };
            }
          }
        });
        if (Object.keys(fieldErrors).length === 0) {
          return new BadRequestException({ message: "Validation failed" });
        }
        return validationException(fieldErrors);
      },
    })
  );

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API server listening on http://localhost:${port}`);
}

bootstrap();
