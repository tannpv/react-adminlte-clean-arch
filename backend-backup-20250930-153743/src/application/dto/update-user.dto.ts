import { Transform } from 'class-transformer'
import { IsArray, IsDateString, IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateUserDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'First name must be text' })
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  firstName?: string

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Last name must be text' })
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  lastName?: string

  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  dateOfBirth?: string

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Picture data must be text' })
  pictureUrl?: string

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

  @Transform(({ value }) => {
    if (typeof value !== 'string') return value
    const trimmed = value.trim()
    return trimmed.length ? trimmed : undefined
  })
  @IsOptional()
  @IsString({ message: 'Password must be at least 6 characters' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string
}
