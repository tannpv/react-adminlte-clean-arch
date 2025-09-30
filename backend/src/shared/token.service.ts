import { Injectable, UnauthorizedException } from '@nestjs/common'
import jwt from 'jsonwebtoken'
import { DEFAULT_JWT_SECRET } from './constants'

export interface TokenPayload {
  sub: number
  iat?: number
  exp?: number
}

@Injectable()
export class TokenService {
  private readonly secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET
  private readonly expiresIn = '1h'

  sign(userId: number): string {
    return jwt.sign({ sub: userId }, this.secret, { expiresIn: this.expiresIn })
  }

  verify(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, this.secret)
      if (typeof payload === 'string') throw new Error('Invalid payload')
      return { sub: Number(payload.sub), iat: payload.iat, exp: payload.exp }
    } catch (error) {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
