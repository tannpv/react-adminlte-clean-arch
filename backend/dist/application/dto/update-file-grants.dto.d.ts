import { FileGrantAccess } from '../../domain/entities/file-grant.entity';
declare class GrantInput {
    roleId: number;
    access: FileGrantAccess;
}
export declare class UpdateFileGrantsDto {
    grants: GrantInput[];
}
export {};
