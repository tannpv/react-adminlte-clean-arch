import { Injectable } from '@nestjs/common';
import { FieldErrorDetail, FieldErrors } from '../validation-error';
import { ValidationResult } from './validation.types';

@Injectable()
export abstract class BaseValidatorService<T> {
  protected createError(field: string, code: string, message: string): FieldErrorDetail {
    return { code, message };
  }

  protected createSuccess(): ValidationResult {
    return { isValid: true, errors: {} };
  }

  protected createFailure(errors: FieldErrors): ValidationResult {
    return { isValid: false, errors };
  }

  protected validateRequiredString(
    value: string | undefined,
    fieldName: string,
    minLength: number = 2
  ): FieldErrorDetail | null {
    const trimmed = value?.trim();
    if (!trimmed || trimmed.length < minLength) {
      return this.createError(
        fieldName,
        `${fieldName.toUpperCase()}_MIN`,
        `${fieldName} is required (min ${minLength} characters)`
      );
    }
    return null;
  }

  protected validateEmail(email: string | undefined): FieldErrorDetail | null {
    const trimmed = email?.trim();
    if (!trimmed) {
      return this.createError('email', 'EMAIL_REQUIRED', 'Email is required');
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(trimmed)) {
      return this.createError('email', 'EMAIL_INVALID', 'Email is invalid');
    }

    return null;
  }

  protected validatePassword(password: string | undefined): FieldErrorDetail | null {
    if (!password?.trim()) {
      return this.createError('password', 'PASSWORD_REQUIRED', 'Password is required');
    }
    if (password.length < 6) {
      return this.createError('password', 'PASSWORD_MIN', 'Password must be at least 6 characters');
    }
    return null;
  }

  protected validateDate(dateString: string | undefined, fieldName: string): FieldErrorDetail | null {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return this.createError(
        fieldName,
        `${fieldName.toUpperCase()}_INVALID`,
        `${fieldName} must be a valid date`
      );
    }
    return null;
  }

  protected validateOptionalString(
    value: string | undefined,
    fieldName: string,
    minLength: number = 2
  ): FieldErrorDetail | null {
    if (value === undefined) return null;
    
    const trimmed = value?.trim();
    if (trimmed && trimmed.length < minLength) {
      return this.createError(
        fieldName,
        `${fieldName.toUpperCase()}_MIN`,
        `${fieldName} must be at least ${minLength} characters`
      );
    }
    return null;
  }
}
