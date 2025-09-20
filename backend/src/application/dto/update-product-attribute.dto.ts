import { Transform, Type } from 'class-transformer'
import { IsArray, IsEnum, IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator'
import { ProductAttributeInputType } from '../../domain/entities/product-attribute.entity'

export class UpdateProductAttributeTermDto {
  @IsOptional()
  @IsString({ message: 'Term name must be text' })
  @MaxLength(255, { message: 'Term name must be at most 255 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string

  @IsOptional()
  @IsString({ message: 'Term slug must be text' })
  @MaxLength(255, { message: 'Term slug must be at most 255 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  slug?: string

  @IsOptional()
  metadata?: Record<string, unknown>

  @IsOptional()
  @IsInt({ message: 'Sort order must be numeric' })
  sortOrder?: number
}

export class UpdateProductAttributeDto {
  @IsOptional()
  @IsString({ message: 'Name must be text' })
  @MaxLength(255, { message: 'Name must be at most 255 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string

  @IsOptional()
  @IsString({ message: 'Slug must be text' })
  @MaxLength(255, { message: 'Slug must be at most 255 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  slug?: string

  @IsOptional()
  @IsString({ message: 'Description must be text' })
  description?: string

  @IsOptional()
  @IsEnum(['select', 'text'] satisfies ProductAttributeInputType[], { message: 'Invalid input type' })
  inputType?: ProductAttributeInputType

  @IsOptional()
  @IsArray({ message: 'Terms must be an array' })
  @ValidateNested({ each: true })
  @Type(() => UpdateProductAttributeTermDto)
  terms?: UpdateProductAttributeTermDto[]
}
