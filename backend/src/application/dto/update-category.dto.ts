import { Transform } from 'class-transformer'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'Name must be text' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(255, { message: 'Name must be at most 255 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string
}

