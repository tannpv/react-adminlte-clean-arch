import { CanActivate, ExecutionContext } from '@nestjs/common';
import { TokenService } from '../../../shared/token.service';
export declare class JwtAuthGuard implements CanActivate {
    private readonly tokenService;
    constructor(tokenService: TokenService);
    canActivate(context: ExecutionContext): boolean;
}
