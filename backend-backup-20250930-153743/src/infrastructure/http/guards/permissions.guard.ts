import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthorizationService } from '../../../application/services/authorization.service'
import { PERMISSIONS_METADATA_KEY, PermissionRequirement } from '../decorators/permissions.decorator'
import { AuthenticatedRequest } from '../interfaces/authenticated-request'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly authorization: AuthorizationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.getAllAndOverride<PermissionRequirement | undefined>(
      PERMISSIONS_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requirement) return true

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const userId = request.userId
    if (!userId) {
      throw new UnauthorizedException({ message: 'Unauthorized' })
    }

    if (requirement.all && requirement.all.length) {
      for (const permission of requirement.all) {
        const allowed = await this.authorization.hasPermission(userId, permission)
        if (!allowed) {
          throw new ForbiddenException({ message: 'Forbidden' })
        }
      }
    }

    if (requirement.any && requirement.any.length) {
      const allowed = await this.authorization.hasAnyPermission(userId, requirement.any)
      if (!allowed) {
        throw new ForbiddenException({ message: 'Forbidden' })
      }
    }

    return true
  }
}
