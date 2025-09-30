import { Controller, Get, NotFoundException, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { AuthenticatedRequest } from '../interfaces/authenticated-request'
import { UsersService } from '../../../application/services/users.service'
import { RolesService } from '../../../application/services/roles.service'
import { AuthorizationService } from '../../../application/services/authorization.service'

@Controller()
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  @Get('me')
  async me(@Req() req: AuthenticatedRequest) {
    const userId = req.userId
    if (!userId) {
      throw new NotFoundException({ message: 'Not found' })
    }

    const user = await this.usersService.findDomainById(userId)
    if (!user) throw new NotFoundException({ message: 'Not found' })

    const roles = await this.rolesService.findMany(user.roles)
    const permissions = Array.from(await this.authorizationService.getPermissions(user.id))

    return {
      user: user.toPublic(),
      roles: roles.map((role) => ({ id: role.id, name: role.name })),
      permissions,
    }
  }
}
