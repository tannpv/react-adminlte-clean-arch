import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common'
import { RolesService } from '../../../application/services/roles.service'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { PermissionsGuard } from '../guards/permissions.guard'
import { RequireAnyPermission, RequirePermissions } from '../decorators/permissions.decorator'
import { CreateRoleDto } from '../../../application/dto/create-role.dto'
import { UpdateRoleDto } from '../../../application/dto/update-role.dto'

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequireAnyPermission('roles:read', 'users:create', 'users:update')
  list() {
    return this.rolesService.list()
  }

  @Post()
  @RequirePermissions('roles:create')
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto)
  }

  @Put(':id')
  @RequirePermissions('roles:update')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto)
  }

  @Delete(':id')
  @RequirePermissions('roles:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id)
  }
}
