import { IsBoolean, IsNumber, IsOptional, Min } from "class-validator";

export class CreateAttributeSetAssignmentDto {
  @IsNumber()
  attributeSetId!: number;

  @IsNumber()
  attributeId!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}
