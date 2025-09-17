import { Transform } from 'class-transformer'
import { IsArray, IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateUserDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Name is required (min 2 characters)' })
  @MinLength(2, { message: 'Name is required (min 2 characters)' })
  name?: string

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsEmail({}, { message: 'Email is invalid' })
  email?: string

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (!Array.isArray(value)) return undefined
    return value
      .map((item) => {
        const num = Number(item)
        return Number.isNaN(num) ? null : num
      })
      .filter((item): item is number => item !== null)
  })
  roles?: number[]
}
