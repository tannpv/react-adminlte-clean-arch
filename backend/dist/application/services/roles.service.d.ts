import { RoleRepository } from '../../domain/repositories/role.repository';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Role } from '../../domain/entities/role.entity';
import { DomainEventBus } from '../../shared/events/domain-event.bus';
import { RoleResponseDto } from '../dto/role-response.dto';
export declare class RolesService {
    private readonly roles;
    private readonly events;
    constructor(roles: RoleRepository, events: DomainEventBus);
    list(): Promise<RoleResponseDto[]>;
    findMany(ids: number[]): Promise<Role[]>;
    findByNameDomain(name: string): Promise<Role | null>;
    findByIdDomain(id: number): Promise<Role | null>;
    create(dto: CreateRoleDto): Promise<RoleResponseDto>;
    update(id: number, dto: UpdateRoleDto): Promise<RoleResponseDto>;
    remove(id: number): Promise<RoleResponseDto>;
}
