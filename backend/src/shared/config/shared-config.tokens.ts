export interface JwtConfig {
  secret: string
  expiresIn: string | number
}

export interface PasswordConfig {
  saltRounds: number
}

export const JWT_CONFIG = Symbol('JWT_CONFIG')
export const PASSWORD_CONFIG = Symbol('PASSWORD_CONFIG')
