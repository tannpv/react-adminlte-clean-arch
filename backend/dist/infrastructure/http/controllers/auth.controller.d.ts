import { AuthService } from '../../../application/services/auth.service';
import { RegisterDto } from '../../../application/dto/register.dto';
import { LoginDto } from '../../../application/dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<import("../../../application/dto/auth-response.dto").AuthResponseDto>;
    login(dto: LoginDto): Promise<import("../../../application/dto/auth-response.dto").AuthResponseDto>;
}
