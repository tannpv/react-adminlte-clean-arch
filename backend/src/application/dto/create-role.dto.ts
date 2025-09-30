import { Transform } from 'class-transformer'
import { IsArray, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateRoleDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Name is required (min 2 characters)' })
  @IsNotEmpty({ message: 'Name is required (min 2 characters)' })
  @MinLength(2, { message: 'Name is required (min 2 characters)' })
  name!: string

  @IsOptional()
  @IsArray()
  permissions?: string[]
}
