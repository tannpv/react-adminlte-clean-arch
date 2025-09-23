// import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class UpdateProductAttributeValueDto {
  // @IsOptional()
  // @IsNumber()
  attributeValueId?: number;

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
