import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common'
import { UsersService } from '../../../application/services/users.service'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { PermissionsGuard } from '../guards/permissions.guard'
import { RequirePermissions } from '../decorators/permissions.decorator'
import { CreateUserDto } from '../../../application/dto/create-user.dto'
import { UpdateUserDto } from '../../../application/dto/update-user.dto'

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users:read')
  list(@Query('search') search?: string) {
    return this.usersService.list({ search })
  }

  @Get(':id')
  @RequirePermissions('users:read')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id)
  }

  @Post()
  @RequirePermissions('users:create')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  @Put(':id')
  @RequirePermissions('users:update')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto)
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id)
  }
}
