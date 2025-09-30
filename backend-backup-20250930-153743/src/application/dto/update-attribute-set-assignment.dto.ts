import { IsBoolean, IsNumber, IsOptional, Min } from "class-validator";

export class UpdateAttributeSetAssignmentDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}
