import { FieldErrorDetail } from "../validation-error";
export declare class CommonValidators {
    static validateEmail(email: string | undefined): FieldErrorDetail | null;
    static validatePassword(password: string | undefined): FieldErrorDetail | null;
    static validateRequiredString(value: string | undefined, fieldName: string, minLength?: number): FieldErrorDetail | null;
    static validateOptionalString(value: string | undefined, fieldName: string, minLength?: number): FieldErrorDetail | null;
    static validateDate(dateString: string | undefined, fieldName: string): FieldErrorDetail | null;
    static validatePositiveNumber(value: number | undefined, fieldName: string): FieldErrorDetail | null;
    static validateArray(value: any[] | undefined, fieldName: string, minLength?: number): FieldErrorDetail | null;
    static validateIntegerArray(value: any[] | undefined, fieldName: string): FieldErrorDetail | null;
}
