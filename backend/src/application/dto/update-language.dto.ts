import { IsBoolean, IsOptional, IsString, Length } from "class-validator";

export class UpdateLanguageDto {
  @IsOptional()
  @IsString()
  @Length(2, 5)
  code?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  nativeName?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  flagIcon?: string;
}
