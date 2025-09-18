import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { PasswordService } from '../../shared/password.service';
import { DomainEventBus } from '../../shared/events/domain-event.bus';
import { UserResponseDto } from '../dto/user-response.dto';
import { RolesService } from './roles.service';
export declare class UsersService {
    private readonly users;
    private readonly rolesService;
    private readonly passwordService;
    private readonly events;
    constructor(users: UserRepository, rolesService: RolesService, passwordService: PasswordService, events: DomainEventBus);
    list(): Promise<UserResponseDto[]>;
    findById(id: number): Promise<UserResponseDto>;
    findDomainById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(dto: CreateUserDto): Promise<UserResponseDto>;
    update(id: number, dto: UpdateUserDto): Promise<UserResponseDto>;
    remove(id: number): Promise<UserResponseDto>;
    private validateRoles;
}
