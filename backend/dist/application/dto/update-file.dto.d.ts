import { FileVisibility } from '../../domain/entities/file.entity';
export declare class UpdateFileDto {
    displayName?: string;
    directoryId?: number | null;
    visibility?: FileVisibility;
}
