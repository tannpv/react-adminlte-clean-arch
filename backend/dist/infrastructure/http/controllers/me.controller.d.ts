import { AuthenticatedRequest } from '../interfaces/authenticated-request';
import { UsersService } from '../../../application/services/users.service';
import { RolesService } from '../../../application/services/roles.service';
import { AuthorizationService } from '../../../application/services/authorization.service';
export declare class MeController {
    private readonly usersService;
    private readonly rolesService;
    private readonly authorizationService;
    constructor(usersService: UsersService, rolesService: RolesService, authorizationService: AuthorizationService);
    me(req: AuthenticatedRequest): Promise<{
        user: import("../../../domain/entities/user.entity").PublicUser;
        roles: {
            id: number;
            name: string;
        }[];
        permissions: string[];
    }>;
}
