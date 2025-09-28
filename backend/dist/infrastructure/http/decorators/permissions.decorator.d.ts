export declare const PERMISSIONS_METADATA_KEY = "permissions";
export interface PermissionRequirement {
    all?: string[];
    any?: string[];
}
export declare const RequirePermissions: (...permissions: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const RequireAnyPermission: (...permissions: string[]) => import("@nestjs/common").CustomDecorator<string>;
