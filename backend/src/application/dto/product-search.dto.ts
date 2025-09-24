import { IsOptional, IsString, IsNumber, IsArray, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum ProductSortBy {
  NAME = 'name',
  PRICE = 'price',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ProductSearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  categoryIds?: number[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  attributeIds?: number[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  attributeValueIds?: number[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  statuses?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];

  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy = ProductSortBy.NAME;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class ProductSearchResponseDto {
  products!: any[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
  facets!: {
    categories: Array<{ id: number; name: string; count: number }>;
    attributes: Array<{ id: number; name: string; values: Array<{ id: number; value: string; count: number }> }>;
    priceRange: { min: number; max: number };
    statuses: Array<{ status: string; count: number }>;
    types: Array<{ type: string; count: number }>;
  };
}
