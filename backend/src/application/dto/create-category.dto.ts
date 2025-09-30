import { Transform } from 'class-transformer'
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, Min } from 'class-validator'

export class CreateCategoryDto {
  @IsString({ message: 'Name is required' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(255, { message: 'Name must be at most 255 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string

  @IsOptional()
  @Transform(({ value }) => (value === null || value === undefined || value === '' ? null : Number(value)))
  @IsInt({ message: 'Parent category must be a valid category' })
  @Min(1, { message: 'Parent category must be valid' })
  parentId?: number | null
}
