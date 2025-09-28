export type FileGrantEntityType = 'file' | 'directory';
export type FileGrantAccess = 'read' | 'write';
export declare class FileGrant {
    readonly id: number;
    entityType: FileGrantEntityType;
    entityId: number;
    roleId: number;
    access: FileGrantAccess;
    constructor(id: number, entityType: FileGrantEntityType, entityId: number, roleId: number, access: FileGrantAccess);
    clone(): FileGrant;
}
