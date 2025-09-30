import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { Role } from './domain/entities/role.entity';
import { UserController } from './api/user.controller';
import { RoleController } from './api/role.controller';
import { UserService } from './application/services/user.service';
import { RoleService } from './application/services/role.service';
import { UserRepository } from './infrastructure/user.repository';
import { RoleRepository } from './infrastructure/role.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [UserController, RoleController],
  providers: [
    UserService,
    RoleService,
    {
      provide: 'UserRepositoryInterface',
      useClass: UserRepository,
    },
    {
      provide: 'RoleRepositoryInterface',
      useClass: RoleRepository,
    },
  ],
  exports: [UserService, RoleService],
})
export class UsersModule {}
