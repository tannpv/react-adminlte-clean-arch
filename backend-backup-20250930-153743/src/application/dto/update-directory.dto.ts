import { Transform } from 'class-transformer'
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator'

export class UpdateDirectoryDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Name must be text' })
  @MinLength(1, { message: 'Name must be at least 1 character' })
  name?: string

  @Transform(({ value }) => (value === undefined || value === null || value === '' ? null : Number(value)))
  @IsOptional()
  @IsInt({ message: 'Parent id must be number' })
  @Min(1, { message: 'Parent id must be positive' })
  parentId?: number | null
}

