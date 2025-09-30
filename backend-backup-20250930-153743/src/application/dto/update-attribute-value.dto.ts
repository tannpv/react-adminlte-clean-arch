import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class UpdateAttributeValueDto {
  @IsOptional()
  @IsString()
  @MaxLength(191)
  valueCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  label?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}
