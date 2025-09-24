import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { ROLE_REPOSITORY, RoleRepository } from '../../domain/repositories/role.repository';
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository';
import { BaseValidatorService } from '../../shared/validation/base-validator.service';
import { ValidationResult } from '../../shared/validation/validation.types';
import { CommonValidators } from '../../shared/validation/common-validators';

@Injectable()
export class UserValidationService extends BaseValidatorService<CreateUserDto> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
  ) {
    super();
  }

  async validate(data: CreateUserDto): Promise<ValidationResult> {
    const errors: Record<string, any> = {};

    // Validate first name
    const firstNameError = this.validateFirstName(data.firstName);
    if (firstNameError) errors.firstName = firstNameError;

    // Validate last name
    const lastNameError = this.validateLastName(data.lastName);
    if (lastNameError) errors.lastName = lastNameError;

    // Validate email
    const emailError = await this.validateEmailUniqueness(data.email);
    if (emailError) errors.email = emailError;

    // Validate roles
    const rolesError = await this.validateRoles(data.roles);
    if (rolesError) errors.roles = rolesError;

    // Validate date of birth
    const dobError = this.validateDateOfBirth(data.dateOfBirth);
    if (dobError) errors.dateOfBirth = dobError;

    // Validate picture URL
    const pictureUrlError = this.validatePictureUrl(data.pictureUrl);
    if (pictureUrlError) errors.pictureUrl = pictureUrlError;

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  private validateFirstName(firstName: string): any {
    return CommonValidators.validateRequiredString(firstName, 'firstName', 2);
  }

  private validateLastName(lastName: string): any {
    return CommonValidators.validateRequiredString(lastName, 'lastName', 2);
  }

  private async validateEmailUniqueness(email: string): Promise<any> {
    // Basic email validation
    const basicError = CommonValidators.validateEmail(email);
    if (basicError) return basicError;

    // Check uniqueness
    const trimmedEmail = email.trim().toLowerCase();
    const existing = await this.users.findByEmail(trimmedEmail);
    if (existing) {
      return this.createError('email', 'EMAIL_EXISTS', 'Email is already in use');
    }

    return null;
  }

  private async validateRoles(roles?: number[]): Promise<any> {
    if (!roles || !Array.isArray(roles)) return null;
    
    // Validate array structure
    const arrayError = CommonValidators.validateIntegerArray(roles, 'roles');
    if (arrayError) return arrayError;

    // Check if roles exist
    const found = await this.roles.findByIds(roles);
    const foundIds = new Set(found.map(role => role.id));
    const missing = roles.filter(roleId => !foundIds.has(roleId));
    
    if (missing.length > 0) {
      return this.createError('roles', 'ROLES_INVALID', 'Invalid roles selected');
    }

    return null;
  }

  private validateDateOfBirth(dateOfBirth?: string): any {
    return CommonValidators.validateDate(dateOfBirth, 'dateOfBirth');
  }

  private validatePictureUrl(pictureUrl?: string): any {
    if (pictureUrl === undefined) return null;
    
    const trimmed = pictureUrl?.trim();
    if (trimmed && trimmed.length > 0) {
      // Basic URL validation
      try {
        new URL(trimmed);
      } catch {
        return this.createError('pictureUrl', 'PICTURE_URL_INVALID', 'Picture URL must be a valid URL');
      }
    }
    
    return null;
  }
}
