export class FileDirectory {
  constructor(
    public readonly id: number,
    public ownerId: number,
    public name: string,
    public parentId: number | null,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  clone(): FileDirectory {
    return new FileDirectory(this.id, this.ownerId, this.name, this.parentId, new Date(this.createdAt), new Date(this.updatedAt))
  }
}

