export type FileGrantEntityType = 'file' | 'directory'
export type FileGrantAccess = 'read' | 'write'

export class FileGrant {
  constructor(
    public readonly id: number,
    public entityType: FileGrantEntityType,
    public entityId: number,
    public roleId: number,
    public access: FileGrantAccess,
  ) {}

  clone(): FileGrant {
    return new FileGrant(this.id, this.entityType, this.entityId, this.roleId, this.access)
  }
}

