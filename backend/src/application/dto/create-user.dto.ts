import { Transform } from 'class-transformer'
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Name is required (min 2 characters)' })
  @IsNotEmpty({ message: 'Name is required (min 2 characters)' })
  @MinLength(2, { message: 'Name is required (min 2 characters)' })
  name!: string

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is invalid' })
  email!: string

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
