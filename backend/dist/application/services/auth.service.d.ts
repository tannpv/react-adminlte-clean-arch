import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordService } from '../../shared/password.service';
import { TokenService } from '../../shared/token.service';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RolesService } from './roles.service';
export declare class AuthService {
    private readonly users;
    private readonly rolesService;
    private readonly passwordService;
    private readonly tokenService;
    constructor(users: UserRepository, rolesService: RolesService, passwordService: PasswordService, tokenService: TokenService);
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    private findDefaultUserRoleId;
}
