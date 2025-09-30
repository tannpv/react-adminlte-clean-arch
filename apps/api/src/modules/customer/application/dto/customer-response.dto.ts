export class CustomerResponseDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  dateOfBirth?: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  constructor(customer: any) {
    this.id = customer.id;
    this.email = customer.email;
    this.firstName = customer.firstName;
    this.lastName = customer.lastName;
    this.phone = customer.phone;
    this.isActive = customer.isActive;
    this.dateOfBirth = customer.dateOfBirth;
    this.address = customer.address;
    this.preferences = customer.preferences;
    this.createdAt = customer.createdAt;
    this.updatedAt = customer.updatedAt;
  }
}
