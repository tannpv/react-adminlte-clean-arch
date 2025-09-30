import { Transform } from 'class-transformer'
import { IsArray, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateRoleDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Name is required (min 2 characters)' })
  @MinLength(2, { message: 'Name is required (min 2 characters)' })
  name?: string

  @IsOptional()
  @IsArray()
  permissions?: string[]
}
