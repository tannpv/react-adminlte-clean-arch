export type FileVisibility = 'private' | 'public';
export declare class FileEntity {
    readonly id: number;
    ownerId: number;
    directoryId: number | null;
    originalName: string;
    displayName: string;
    storageKey: string;
    mimeType: string | null;
    sizeBytes: number | null;
    visibility: FileVisibility;
    createdAt: Date;
    updatedAt: Date;
    url: string | null;
    constructor(id: number, ownerId: number, directoryId: number | null, originalName: string, displayName: string, storageKey: string, mimeType: string | null, sizeBytes: number | null, visibility: FileVisibility, createdAt: Date, updatedAt: Date, url?: string | null);
    clone(): FileEntity;
}
