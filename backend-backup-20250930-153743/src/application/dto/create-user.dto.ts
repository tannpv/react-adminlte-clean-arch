import { Transform } from 'class-transformer'
import { IsArray, IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'First name is required (min 2 characters)' })
  @IsNotEmpty({ message: 'First name is required (min 2 characters)' })
  @MinLength(2, { message: 'First name is required (min 2 characters)' })
  firstName!: string

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Last name is required (min 2 characters)' })
  @IsNotEmpty({ message: 'Last name is required (min 2 characters)' })
  @MinLength(2, { message: 'Last name is required (min 2 characters)' })
  lastName!: string

  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  dateOfBirth?: string

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Picture data must be text' })
  pictureUrl?: string

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
