import { AuthService } from '../../../application/services/auth.service';
import { RegisterDto } from '../../../application/dto/register.dto';
import { LoginDto } from '../../../application/dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        token: string;
        user: import("../../../domain/entities/user.entity").PublicUser;
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: import("../../../domain/entities/user.entity").PublicUser;
    }>;
}
