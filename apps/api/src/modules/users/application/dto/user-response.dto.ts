export class UserResponseDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  dateOfBirth?: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences?: Record<string, any>;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  roles: RoleResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  constructor(user: any) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.fullName = user.fullName || `${user.firstName} ${user.lastName}`.trim();
    this.phone = user.phone;
    this.isActive = user.isActive;
    this.isEmailVerified = user.isEmailVerified;
    this.dateOfBirth = user.dateOfBirth;
    this.address = user.address;
    this.preferences = user.preferences;
    this.lastLoginAt = user.lastLoginAt;
    this.passwordChangedAt = user.passwordChangedAt;
    this.roles = user.roles?.map((role: any) => new RoleResponseDto(role)) || [];
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

export class RoleResponseDto {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  permissions?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  constructor(role: any) {
    this.id = role.id;
    this.name = role.name;
    this.description = role.description;
    this.isActive = role.isActive;
    this.permissions = role.permissions;
    this.metadata = role.metadata;
    this.createdAt = role.createdAt;
    this.updatedAt = role.updatedAt;
  }
}
