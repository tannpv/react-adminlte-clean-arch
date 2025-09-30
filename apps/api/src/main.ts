import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);
    
    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));
    
    // CORS configuration
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5178',
      credentials: true,
    });
    
    // Global prefix
    app.setGlobalPrefix('api/v1');
    
    const port = process.env.PORT || 3001;
    await app.listen(port);
    
    logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
    logger.log(`📊 Health check: http://localhost:${port}/api/v1/health`);
    
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
