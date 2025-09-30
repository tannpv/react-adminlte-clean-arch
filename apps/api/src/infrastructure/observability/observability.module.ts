import { LoggerModule, Module } from '@nestjs/common';

@Module({
  imports: [
    LoggerModule.forRoot({
      // Configure logging here
    }),
  ],
  exports: [LoggerModule],
})
export class ObservabilityModule {}
