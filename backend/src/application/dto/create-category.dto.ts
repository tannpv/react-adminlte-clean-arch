import { Transform } from 'class-transformer'
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateCategoryDto {
  @IsString({ message: 'Name is required' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(255, { message: 'Name must be at most 255 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string
}

