export declare class FileDirectory {
    readonly id: number;
    ownerId: number;
    name: string;
    parentId: number | null;
    createdAt: Date;
    updatedAt: Date;
    constructor(id: number, ownerId: number, name: string, parentId: number | null, createdAt: Date, updatedAt: Date);
    clone(): FileDirectory;
}
