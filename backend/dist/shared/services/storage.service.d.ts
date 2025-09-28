export declare class StorageService {
    private readonly uploadRoot;
    private ensureDir;
    private buildPublicUrl;
    save(buffer: Buffer, originalName: string): Promise<{
        storageKey: string;
        url: string;
    }>;
    delete(storageKey: string | null | undefined): Promise<void>;
    getLocalServePath(storageKey: string): string;
    getPublicUrl(storageKey: string): string;
}
