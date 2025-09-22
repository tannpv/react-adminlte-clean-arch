// import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateProductAttributeValueDto {
  // @IsNumber()
  productId!: number;

  // @IsNumber()
  attributeId!: number;

  // @IsOptional()
  // @IsString()
  valueText?: string;

  // @IsOptional()
  // @IsNumber()
  valueNumber?: number;

  // @IsOptional()
  // @IsBoolean()
  valueBoolean?: boolean;
}
