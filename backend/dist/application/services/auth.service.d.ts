import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { PasswordService } from '../../shared/password.service';
import { TokenService } from '../../shared/token.service';
export declare class AuthService {
    private readonly users;
    private readonly roles;
    private readonly passwordService;
    private readonly tokenService;
    constructor(users: UserRepository, roles: RoleRepository, passwordService: PasswordService, tokenService: TokenService);
    register(dto: RegisterDto): Promise<{
        token: string;
        user: import("../../domain/entities/user.entity").PublicUser;
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: import("../../domain/entities/user.entity").PublicUser;
    }>;
    private findDefaultUserRoleId;
}
