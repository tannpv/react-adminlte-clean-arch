import { FileEntity } from '../entities/file.entity'

export interface FileRepository {
  findById(id: number): Promise<FileEntity | null>
  findByIds(ids: number[]): Promise<FileEntity[]>
  findByDirectory(ownerId: number, directoryId: number | null): Promise<FileEntity[]>
  findByDirectoryAny(directoryId: number | null): Promise<FileEntity[]>
  create(file: FileEntity): Promise<FileEntity>
  update(file: FileEntity): Promise<FileEntity>
  remove(id: number): Promise<void>
}

export const FILE_REPOSITORY = 'FILE_REPOSITORY'
