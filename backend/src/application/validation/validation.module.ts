import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../infrastructure/persistence/persistence.module';
import { UserValidationService } from './user-validation.service';
import { UserUpdateValidationService } from './user-update-validation.service';

@Module({
  imports: [PersistenceModule],
  providers: [
    UserValidationService,
    UserUpdateValidationService,
  ],
  exports: [
    UserValidationService,
    UserUpdateValidationService,
  ],
})
export class ValidationModule {}
