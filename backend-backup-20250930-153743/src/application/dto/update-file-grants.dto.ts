import { Type } from 'class-transformer'
import { IsArray, ValidateNested, IsInt, Min, IsEnum } from 'class-validator'
import { FileGrantAccess } from '../../domain/entities/file-grant.entity'

class GrantInput {
  @IsInt({ message: 'Role id must be number' })
  @Min(1, { message: 'Role id must be positive' })
  roleId!: number

  @IsEnum(['read', 'write'], { message: 'Access must be read or write' })
  access!: FileGrantAccess
}

export class UpdateFileGrantsDto {
  @IsArray({ message: 'Grants must be an array' })
  @ValidateNested({ each: true })
  @Type(() => GrantInput)
  grants!: GrantInput[]
}

