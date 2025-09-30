import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateAttributeDto {
  @IsOptional()
  @IsString()
  @MaxLength(191)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  name?: string;

  @IsOptional()
  @IsEnum(["select", "multiselect", "text", "number", "boolean"])
  inputType?: "select" | "multiselect" | "text" | "number" | "boolean";

  @IsOptional()
  @IsEnum(["string", "number", "boolean"])
  dataType?: "string" | "number" | "boolean";

  @IsOptional()
  @IsString()
  @MaxLength(32)
  unit?: string;
}
