import { Transform } from 'class-transformer'
import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class RegisterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'First name is required (min 2 characters)' })
  @MinLength(2, { message: 'First name is required (min 2 characters)' })
  firstName!: string

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Last name is required (min 2 characters)' })
  @MinLength(2, { message: 'Last name is required (min 2 characters)' })
  lastName!: string

  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  dateOfBirth?: string

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Picture URL must be text' })
  @MaxLength(1024, { message: 'Picture URL is too long' })
  pictureUrl?: string

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is invalid' })
  email!: string

  @IsString({ message: 'Password is required' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string
}
