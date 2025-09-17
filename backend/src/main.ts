import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ValidationError } from 'class-validator'
import { AppModule } from './app.module'
import { validationException } from './shared/validation-error'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const fieldErrors: Record<string, { code: string; message: string }> = {}
        validationErrors.forEach((error) => {
          if (error.constraints) {
            const messages = Object.values(error.constraints)
            if (messages.length) {
              fieldErrors[error.property] = { code: 'VALIDATION_ERROR', message: messages[0] }
            }
          }
        })
        if (Object.keys(fieldErrors).length === 0) {
          return new BadRequestException({ message: 'Validation failed' })
        }
        return validationException(fieldErrors)
      },
    }),
  )

  const port = Number(process.env.PORT) || 3001
  await app.listen(port)
  // eslint-disable-next-line no-console
  console.log(`API server listening on http://localhost:${port}`)
}

bootstrap()
