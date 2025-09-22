// import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateProductVariantDto {
  // @IsNumber()
  productId!: number;

  // @IsString()
  sku!: string;

  // @IsString()
  name!: string;

  // @IsNumber()
  priceCents!: number;

  // @IsOptional()
  // @IsString()
  currency?: string;

  // @IsOptional()
  // @IsString()
  status?: string;
}
