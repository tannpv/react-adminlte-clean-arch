import { Transform } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator'
import { FileVisibility } from '../../domain/entities/file.entity'

export class UpdateFileDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Display name must be text' })
  @MinLength(1, { message: 'Display name must be at least 1 character' })
  displayName?: string

  @Transform(({ value }) => (value === undefined || value === null || value === '' ? null : Number(value)))
  @IsOptional()
  @IsInt({ message: 'Directory id must be number' })
  @Min(1, { message: 'Directory id must be positive' })
  directoryId?: number | null

  @IsOptional()
  @IsEnum(['private', 'public'], { message: 'Visibility must be private or public' })
  visibility?: FileVisibility
}

