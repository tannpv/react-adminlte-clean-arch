import { IsBoolean, IsDateString, IsEmail, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsObject()
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;
}
