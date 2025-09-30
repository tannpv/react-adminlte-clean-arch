import { FileGrant, FileGrantEntityType, FileGrantAccess } from '../entities/file-grant.entity'

export interface FileGrantRepository {
  findByEntity(entityType: FileGrantEntityType, entityId: number): Promise<FileGrant[]>
  findForRole(entityType: FileGrantEntityType, entityId: number, roleIds: number[]): Promise<FileGrant[]>
  create(grant: FileGrant): Promise<FileGrant>
  remove(id: number): Promise<void>
  removeForEntity(entityType: FileGrantEntityType, entityId: number): Promise<void>
}

export const FILE_GRANT_REPOSITORY = 'FILE_GRANT_REPOSITORY'

