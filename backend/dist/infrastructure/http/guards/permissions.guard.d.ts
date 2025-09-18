import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthorizationService } from '../../../application/services/authorization.service';
export declare class PermissionsGuard implements CanActivate {
    private readonly reflector;
    private readonly authorization;
    constructor(reflector: Reflector, authorization: AuthorizationService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
