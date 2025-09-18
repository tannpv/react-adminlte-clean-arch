import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import jwt, { SignOptions } from 'jsonwebtoken'
import { DEFAULT_JWT_SECRET } from './constants'
import { JWT_CONFIG, JwtConfig } from './config'

export interface TokenPayload {
  sub: number
  iat?: number
  exp?: number
}

@Injectable()
export class TokenService {
  constructor(@Inject(JWT_CONFIG) private readonly options: JwtConfig) {}

  sign(userId: number): string {
    const options: SignOptions = {}
    if (this.options.expiresIn !== undefined) {
      options.expiresIn = this.options.expiresIn as SignOptions['expiresIn']
    }
    return jwt.sign({ sub: userId }, this.options.secret, options)
  }

  verify(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, this.options.secret)
      if (typeof payload === 'string') throw new Error('Invalid payload')
      return { sub: Number(payload.sub), iat: payload.iat, exp: payload.exp }
    } catch (error) {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
