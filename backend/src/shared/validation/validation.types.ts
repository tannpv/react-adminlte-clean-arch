import { FieldErrors } from "../validation-error";

export interface ValidationResult {
  isValid: boolean;
  errors: FieldErrors;
}

export interface Validator<T> {
  validate(data: T): Promise<ValidationResult>;
}

export interface UpdateValidator<T> {
  validate(data: T, id: number): Promise<ValidationResult>;
}

export interface ValidationContext {
  userId?: number;
  productId?: number;
  categoryId?: number;
  [key: string]: any;
}
