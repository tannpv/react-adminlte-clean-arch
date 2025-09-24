import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { PublicUser, User } from '../../domain/entities/user.entity';
import { PasswordService } from '../../shared/password.service';
import { UserValidationService } from '../validation/user-validation.service';
import { UserUpdateValidationService } from '../validation/user-update-validation.service';
export declare class UsersService {
    private readonly users;
    private readonly roles;
    private readonly passwordService;
    private readonly userValidationService;
    private readonly userUpdateValidationService;
    constructor(users: UserRepository, roles: RoleRepository, passwordService: PasswordService, userValidationService: UserValidationService, userUpdateValidationService: UserUpdateValidationService);
    list({ search }?: {
        search?: string;
    }): Promise<PublicUser[]>;
    findById(id: number): Promise<PublicUser>;
    findDomainById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(dto: CreateUserDto): Promise<PublicUser>;
    update(id: number, dto: UpdateUserDto): Promise<PublicUser>;
    remove(id: number): Promise<PublicUser>;
}
