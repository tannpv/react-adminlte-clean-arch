import { Transform } from 'class-transformer'
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator'

export class CreateDirectoryDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Name is required' })
  @MinLength(1, { message: 'Name is required' })
  name!: string

  @Transform(({ value }) => (value === undefined || value === null || value === '' ? null : Number(value)))
  @IsOptional()
  @IsInt({ message: 'Parent id must be number' })
  @Min(1, { message: 'Parent id must be positive' })
  parentId?: number | null
}

