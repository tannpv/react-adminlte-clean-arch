import { RolesService } from '../../../application/services/roles.service';
import { CreateRoleDto } from '../../../application/dto/create-role.dto';
import { UpdateRoleDto } from '../../../application/dto/update-role.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    list(): Promise<import("../../../application/dto/role-response.dto").RoleResponseDto[]>;
    create(dto: CreateRoleDto): Promise<import("../../../application/dto/role-response.dto").RoleResponseDto>;
    update(id: number, dto: UpdateRoleDto): Promise<import("../../../application/dto/role-response.dto").RoleResponseDto>;
    remove(id: number): Promise<import("../../../application/dto/role-response.dto").RoleResponseDto>;
}
