import { Permission } from '../value-objects/permission.type';
export declare class Role {
    readonly id: number;
    name: string;
    permissions: Permission[];
    constructor(id: number, name: string, permissions?: Permission[]);
    clone(): Role;
}
