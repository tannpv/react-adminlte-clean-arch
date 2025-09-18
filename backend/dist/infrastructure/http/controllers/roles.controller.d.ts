import { RolesService } from '../../../application/services/roles.service';
import { CreateRoleDto } from '../../../application/dto/create-role.dto';
import { UpdateRoleDto } from '../../../application/dto/update-role.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    list(): Promise<import("../../../domain/entities/role.entity").Role[]>;
    create(dto: CreateRoleDto): Promise<import("../../../domain/entities/role.entity").Role>;
    update(id: number, dto: UpdateRoleDto): Promise<import("../../../domain/entities/role.entity").Role>;
    remove(id: number): Promise<import("../../../domain/entities/role.entity").Role>;
}
