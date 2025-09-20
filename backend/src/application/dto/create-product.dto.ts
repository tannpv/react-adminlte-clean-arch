import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  ArrayUnique,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  IsBoolean,
  ValidateNested,
  IsInt,
} from 'class-validator'
import { ProductStatus, ProductType } from '../../domain/entities/product.entity'

const statuses: ProductStatus[] = ['draft', 'published', 'archived']
const productTypes: ProductType[] = ['simple', 'variable']

export class ProductAttributeTermDto {
  @IsInt({ message: 'Attribute term id must be a number' })
  termId!: number

  @IsString({ message: 'Attribute term name is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  termName!: string

  @IsString({ message: 'Attribute term slug is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  termSlug!: string
}

export class ProductAttributeDto {
  @IsInt({ message: 'Attribute id must be a number' })
  attributeId!: number

  @IsString({ message: 'Attribute name is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  attributeName!: string

  @IsString({ message: 'Attribute slug is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  attributeSlug!: string

  @IsArray({ message: 'Attribute terms must be an array' })
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeTermDto)
  terms!: ProductAttributeTermDto[]

  @IsBoolean({ message: 'Attribute visibility must be boolean' })
  visible!: boolean

  @IsBoolean({ message: 'Attribute variation flag must be boolean' })
  variation!: boolean
}

export class ProductVariantAttributeDto {
  @IsInt({ message: 'Variant attribute id must be a number' })
  attributeId!: number

  @IsString({ message: 'Variant attribute name is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  attributeName!: string

  @IsString({ message: 'Variant attribute slug is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  attributeSlug!: string

  @IsInt({ message: 'Variant term id must be a number' })
  termId!: number

  @IsString({ message: 'Variant term name is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  termName!: string

  @IsString({ message: 'Variant term slug is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  termSlug!: string
}

export class ProductVariantDto {
  @IsOptional()
  @IsInt({ message: 'Variant id must be a number' })
  id?: number

  @IsString({ message: 'Variant SKU is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  sku!: string

  @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
  @IsNumber({ allowInfinity: false, allowNaN: false }, { message: 'Variant price must be a number' })
  @IsPositive({ message: 'Variant price must be positive' })
  price!: number

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
  @IsNumber({ allowInfinity: false, allowNaN: false }, { message: 'Variant sale price must be a number' })
  salePrice?: number | null

  @IsString({ message: 'Variant currency is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  currency!: string

  @IsOptional()
  @IsEnum(statuses, { message: 'Invalid variant status provided' })
  status?: ProductStatus

  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false }, { message: 'Variant stock quantity must be numeric' })
  stockQuantity?: number | null

  @IsOptional()
  metadata?: Record<string, unknown>

  @IsArray({ message: 'Variant attributes must be an array' })
  @ValidateNested({ each: true })
  @Type(() => ProductVariantAttributeDto)
  attributes!: ProductVariantAttributeDto[]
}

export class CreateProductDto {
  @IsString({ message: 'SKU is required' })
  @MinLength(2, { message: 'SKU must be at least 2 characters' })
  @MaxLength(64, { message: 'SKU must be at most 64 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  sku!: string

  @IsString({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(255, { message: 'Name must be at most 255 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string

  @IsOptional()
  @IsString({ message: 'Description must be text' })
  description?: string

  @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be positive' })
  price!: number

  @IsString({ message: 'Currency is required' })
  @MinLength(3, { message: 'Currency must be 3 characters' })
  @MaxLength(8, { message: 'Currency must be at most 8 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  currency!: string

  @IsOptional()
  @IsEnum(statuses, { message: 'Invalid status provided' })
  status?: ProductStatus

  @IsOptional()
  metadata?: Record<string, unknown>

  @IsOptional()
  @IsArray({ message: 'Categories must be an array' })
  @ArrayUnique({ message: 'Categories must be unique' })
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined
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

  @IsOptional()
  @IsEnum(productTypes, { message: 'Invalid product type provided' })
  type?: ProductType

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined
    const num = Number(value)
    return Number.isFinite(num) ? num : undefined
  })
  @IsInt({ message: 'Attribute set must be numeric' })
  attributeSetId?: number

  @IsOptional()
  @IsArray({ message: 'Attributes must be an array' })
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes?: ProductAttributeDto[]

  @IsOptional()
  @IsArray({ message: 'Variants must be an array' })
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[]
}
