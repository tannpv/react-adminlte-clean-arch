import { FieldErrorDetail } from '../validation-error';

export class CommonValidators {
  static validateEmail(email: string | undefined): FieldErrorDetail | null {
    const trimmed = email?.trim();
    if (!trimmed) {
      return { code: 'EMAIL_REQUIRED', message: 'Email is required' };
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(trimmed)) {
      return { code: 'EMAIL_INVALID', message: 'Email is invalid' };
    }

    return null;
  }

  static validatePassword(password: string | undefined): FieldErrorDetail | null {
    if (!password?.trim()) {
      return { code: 'PASSWORD_REQUIRED', message: 'Password is required' };
    }
    if (password.length < 6) {
      return { code: 'PASSWORD_MIN', message: 'Password must be at least 6 characters' };
    }
    return null;
  }

  static validateRequiredString(
    value: string | undefined,
    fieldName: string,
    minLength: number = 2
  ): FieldErrorDetail | null {
    const trimmed = value?.trim();
    if (!trimmed || trimmed.length < minLength) {
      return { 
        code: `${fieldName.toUpperCase()}_MIN`, 
        message: `${fieldName} is required (min ${minLength} characters)` 
      };
    }
    return null;
  }

  static validateOptionalString(
    value: string | undefined,
    fieldName: string,
    minLength: number = 2
  ): FieldErrorDetail | null {
    if (value === undefined) return null;
    
    const trimmed = value?.trim();
    if (trimmed && trimmed.length < minLength) {
      return { 
        code: `${fieldName.toUpperCase()}_MIN`, 
        message: `${fieldName} must be at least ${minLength} characters` 
      };
    }
    return null;
  }

  static validateDate(dateString: string | undefined, fieldName: string): FieldErrorDetail | null {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return { 
        code: `${fieldName.toUpperCase()}_INVALID`, 
        message: `${fieldName} must be a valid date` 
      };
    }
    return null;
  }

  static validatePositiveNumber(
    value: number | undefined,
    fieldName: string
  ): FieldErrorDetail | null {
    if (value === undefined) return null;
    
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return {
        code: `${fieldName.toUpperCase()}_INVALID`,
        message: `${fieldName} must be a valid number`
      };
    }
    
    if (value <= 0) {
      return {
        code: `${fieldName.toUpperCase()}_POSITIVE`,
        message: `${fieldName} must be positive`
      };
    }
    
    return null;
  }

  static validateArray(
    value: any[] | undefined,
    fieldName: string,
    minLength: number = 0
  ): FieldErrorDetail | null {
    if (value === undefined) return null;
    
    if (!Array.isArray(value)) {
      return {
        code: `${fieldName.toUpperCase()}_INVALID`,
        message: `${fieldName} must be an array`
      };
    }
    
    if (value.length < minLength) {
      return {
        code: `${fieldName.toUpperCase()}_MIN_LENGTH`,
        message: `${fieldName} must have at least ${minLength} items`
      };
    }
    
    return null;
  }

  static validateIntegerArray(
    value: any[] | undefined,
    fieldName: string
  ): FieldErrorDetail | null {
    const arrayError = this.validateArray(value, fieldName);
    if (arrayError) return arrayError;
    
    if (value === undefined) return null;
    
    const invalidItems = value.filter(item => !Number.isInteger(item));
    if (invalidItems.length > 0) {
      return {
        code: `${fieldName.toUpperCase()}_INVALID_ITEMS`,
        message: `${fieldName} must contain only integers`
      };
    }
    
    return null;
  }
}
