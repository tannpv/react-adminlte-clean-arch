import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateAttributeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  name!: string;

  @IsEnum(["select", "multiselect", "text", "number", "boolean"])
  inputType!: "select" | "multiselect" | "text" | "number" | "boolean";

  @IsEnum(["string", "number", "boolean"])
  dataType!: "string" | "number" | "boolean";

  @IsOptional()
  @IsString()
  @MaxLength(32)
  unit?: string;
}
