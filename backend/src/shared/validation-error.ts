import { BadRequestException } from '@nestjs/common'

export interface FieldErrorDetail {
  code: string
  message: string
}

export type FieldErrors = Record<string, FieldErrorDetail | string>

export function validationException(fieldErrors: FieldErrors): BadRequestException {
  const details: Record<string, FieldErrorDetail> = {}
  const simple: Record<string, string> = {}

  for (const [field, value] of Object.entries(fieldErrors)) {
    if (typeof value === 'string') {
      const detail = { code: 'VALIDATION_ERROR', message: value }
      details[field] = detail
      simple[field] = value
    } else {
      details[field] = value
      simple[field] = value.message
    }
  }

  return new BadRequestException({
    message: 'Validation failed',
    errors: simple,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: {
        fieldErrors: details,
      },
    },
  })
}
