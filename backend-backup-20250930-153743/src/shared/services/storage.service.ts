import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { promises as fs } from 'fs'
import * as path from 'path'
import { randomUUID } from 'crypto'

@Injectable()
export class StorageService {
  private readonly uploadRoot = process.env.FILE_STORAGE_ROOT
    ? path.resolve(process.env.FILE_STORAGE_ROOT)
    : path.resolve(process.cwd(), 'uploads')

  private async ensureDir(dir: string): Promise<void> {
    await fs.mkdir(dir, { recursive: true })
  }

  private buildPublicUrl(storageKey: string): string {
    const publicBase = process.env.FILE_PUBLIC_BASE_URL
    if (publicBase && publicBase.trim().length) {
      return `${publicBase.replace(/\/$/, '')}/${storageKey}`
    }
    return `/uploads/${storageKey}`
  }

  async save(buffer: Buffer, originalName: string): Promise<{ storageKey: string; url: string }> {
    const ext = path.extname(originalName || '').slice(0, 16)
    const key = `${randomUUID()}${ext}`
    const targetDir = this.uploadRoot
    const targetPath = path.join(targetDir, key)
    try {
      await this.ensureDir(targetDir)
      await fs.writeFile(targetPath, buffer)
    } catch (err) {
      throw new InternalServerErrorException({ message: 'Failed to store file' })
    }

    return { storageKey: key, url: this.buildPublicUrl(key) }
  }

  async delete(storageKey: string | null | undefined): Promise<void> {
    if (!storageKey) return
    const targetPath = path.join(this.uploadRoot, storageKey)
    try {
      await fs.unlink(targetPath)
    } catch (err: any) {
      if (err?.code !== 'ENOENT') {
        throw new InternalServerErrorException({ message: 'Failed to delete file' })
      }
    }
  }

  getLocalServePath(storageKey: string): string {
    return path.join(this.uploadRoot, storageKey)
  }

  getPublicUrl(storageKey: string): string {
    return this.buildPublicUrl(storageKey)
  }
}
