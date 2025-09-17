import { Module } from '@nestjs/common'
import { FileDatabaseService } from './file/file-database.service'
import { FileUserRepository } from './file/file-user.repository'
import { FileRoleRepository } from './file/file-role.repository'
import { USER_REPOSITORY } from '../../domain/repositories/user.repository'
import { ROLE_REPOSITORY } from '../../domain/repositories/role.repository'
import { SharedModule } from '../../shared/shared.module'

@Module({
  imports: [SharedModule],
  providers: [
    FileDatabaseService,
    { provide: USER_REPOSITORY, useClass: FileUserRepository },
    { provide: ROLE_REPOSITORY, useClass: FileRoleRepository },
  ],
  exports: [USER_REPOSITORY, ROLE_REPOSITORY],
})
export class PersistenceModule {}
