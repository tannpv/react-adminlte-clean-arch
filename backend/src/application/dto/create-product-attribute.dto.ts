import { Transform, Type } from 'class-transformer'
import { IsArray, IsEnum, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator'
import { ProductAttributeInputType } from '../../domain/entities/product-attribute.entity'

export class CreateProductAttributeTermDto {
  @IsString({ message: 'Term name is required' })
  @MaxLength(255, { message: 'Term name must be at most 255 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string

  @IsString({ message: 'Term slug is required' })
  @MaxLength(255, { message: 'Term slug must be at most 255 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  slug!: string

  @IsOptional()
  metadata?: Record<string, unknown>
}

export class CreateProductAttributeDto {
  @IsString({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name must be at most 255 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string

  @IsString({ message: 'Slug is required' })
  @MaxLength(255, { message: 'Slug must be at most 255 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  slug!: string

  @IsOptional()
  @IsString({ message: 'Description must be text' })
  description?: string

  @IsEnum(['select', 'text'] satisfies ProductAttributeInputType[], { message: 'Invalid input type' })
  inputType!: ProductAttributeInputType

  @IsOptional()
  @IsArray({ message: 'Terms must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateProductAttributeTermDto)
  terms?: CreateProductAttributeTermDto[]
}
