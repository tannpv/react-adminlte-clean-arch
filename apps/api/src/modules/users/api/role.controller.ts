import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RoleService } from '../application/services/role.service';
import { CreateRoleDto } from '../application/dto/create-role.dto';
import { UpdateRoleDto } from '../application/dto/update-role.dto';
import { RoleResponseDto } from '../application/dto/user-response.dto';
import { PaginationDto, PaginatedResponseDto } from '../../../shared/dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResponseDto<RoleResponseDto>> {
    return this.roleService.findAll(paginationDto);
  }

  @Get('active')
  async findActive(): Promise<RoleResponseDto[]> {
    return this.roleService.findActive();
  }

  @Get('count')
  async count(): Promise<{ count: number }> {
    const count = await this.roleService.count();
    return { count };
  }

  @Get('permission/:permission')
  async findByPermission(@Param('permission') permission: string): Promise<RoleResponseDto[]> {
    return this.roleService.findByPermission(permission);
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string): Promise<RoleResponseDto> {
    return this.roleService.findByName(name);
  }

  @Get('exists/:name')
  async existsByName(@Param('name') name: string): Promise<{ exists: boolean }> {
    const exists = await this.roleService.existsByName(name);
    return { exists };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RoleResponseDto> {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.roleService.remove(id);
  }
}
