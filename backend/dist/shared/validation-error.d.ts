import { BadRequestException } from '@nestjs/common';
export interface FieldErrorDetail {
    code: string;
    message: string;
}
export type FieldErrors = Record<string, FieldErrorDetail | string>;
export declare function validationException(fieldErrors: FieldErrors): BadRequestException;
