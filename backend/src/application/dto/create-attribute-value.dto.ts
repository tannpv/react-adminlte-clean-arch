import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class CreateAttributeValueDto {
  @IsNumber()
  attributeId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  valueCode!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  label!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}
