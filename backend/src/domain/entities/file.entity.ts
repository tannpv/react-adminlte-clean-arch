export type FileVisibility = 'private' | 'public'

export class FileEntity {
  constructor(
    public readonly id: number,
    public ownerId: number,
    public directoryId: number | null,
    public originalName: string,
    public displayName: string,
    public storageKey: string,
    public mimeType: string | null,
    public sizeBytes: number | null,
    public visibility: FileVisibility,
    public createdAt: Date,
    public updatedAt: Date,
    public url: string | null = null,
  ) {}

  clone(): FileEntity {
    return new FileEntity(
      this.id,
      this.ownerId,
      this.directoryId,
      this.originalName,
      this.displayName,
      this.storageKey,
      this.mimeType,
      this.sizeBytes,
      this.visibility,
      new Date(this.createdAt),
      new Date(this.updatedAt),
      this.url,
    )
  }
}

