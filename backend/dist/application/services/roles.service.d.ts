import { RoleRepository } from '../../domain/repositories/role.repository';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Role } from '../../domain/entities/role.entity';
export declare class RolesService {
    private readonly roles;
    constructor(roles: RoleRepository);
    list(): Promise<Role[]>;
    findMany(ids: number[]): Promise<Role[]>;
    create(dto: CreateRoleDto): Promise<Role>;
    update(id: number, dto: UpdateRoleDto): Promise<Role>;
    remove(id: number): Promise<Role>;
}
