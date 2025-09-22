// import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateProductVariantDto {
  // @IsOptional()
  // @IsString()
  sku?: string;

  // @IsOptional()
  // @IsString()
  name?: string;

  // @IsOptional()
  // @IsNumber()
  priceCents?: number;

  // @IsOptional()
  // @IsString()
  currency?: string;

  // @IsOptional()
  // @IsString()
  status?: string;
}
