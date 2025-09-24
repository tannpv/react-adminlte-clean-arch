import { FieldErrorDetail, FieldErrors } from '../validation-error';
import { ValidationResult } from './validation.types';
export declare abstract class BaseValidatorService<T> {
    protected createError(field: string, code: string, message: string): FieldErrorDetail;
    protected createSuccess(): ValidationResult;
    protected createFailure(errors: FieldErrors): ValidationResult;
    protected validateRequiredString(value: string | undefined, fieldName: string, minLength?: number): FieldErrorDetail | null;
    protected validateEmail(email: string | undefined): FieldErrorDetail | null;
    protected validatePassword(password: string | undefined): FieldErrorDetail | null;
    protected validateDate(dateString: string | undefined, fieldName: string): FieldErrorDetail | null;
    protected validateOptionalString(value: string | undefined, fieldName: string, minLength?: number): FieldErrorDetail | null;
}
