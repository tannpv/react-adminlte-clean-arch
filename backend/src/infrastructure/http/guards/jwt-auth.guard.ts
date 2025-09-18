import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { TokenService } from '../../../shared/token.service'
import { AuthenticatedRequest } from '../interfaces/authenticated-request'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const authHeader = request.headers?.authorization
    const bearer = Array.isArray(authHeader) ? authHeader[0] : authHeader || ''
    const [, token] = bearer.split(' ')

    if (!token) {
      throw new UnauthorizedException({ message: 'Unauthorized' })
    }

    const payload = this.tokenService.verify(token)
    const userId = Number(payload.sub)
    if (!userId) {
      throw new UnauthorizedException({ message: 'Invalid token' })
    }
    request.userId = userId
    return true
  }
}
