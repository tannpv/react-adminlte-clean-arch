import { Transform } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength, IsArray, ArrayUnique } from 'class-validator'
import { ProductStatus } from '../../domain/entities/product.entity'

const statuses: ProductStatus[] = ['draft', 'published', 'archived']

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'SKU must be text' })
  @MinLength(2, { message: 'SKU must be at least 2 characters' })
  @MaxLength(64, { message: 'SKU must be at most 64 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  sku?: string

  @IsOptional()
  @IsString({ message: 'Name must be text' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(255, { message: 'Name must be at most 255 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string

  @IsOptional()
  @IsString({ message: 'Description must be text' })
  description?: string

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be positive' })
  price?: number

  @IsOptional()
  @IsString({ message: 'Currency must be text' })
  @MinLength(3, { message: 'Currency must be 3 characters' })
  @MaxLength(8, { message: 'Currency must be at most 8 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  currency?: string

  @IsOptional()
  @IsEnum(statuses, { message: 'Invalid status provided' })
  status?: ProductStatus

  @IsOptional()
  metadata?: Record<string, unknown>

  @IsOptional()
  @IsArray({ message: 'Categories must be an array' })
  @ArrayUnique({ message: 'Categories must be unique' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return value
    const array = Array.isArray(value) ? value : [value]
    const numbers = array
      .map((entry) => {
        const num = Number(entry)
        return Number.isFinite(num) ? num : null
      })
      .filter((num): num is number => num !== null)
    return numbers
  })
  categories?: number[]
}
