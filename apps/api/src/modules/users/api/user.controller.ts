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
import { UserService } from '../application/services/user.service';
import { CreateUserDto } from '../application/dto/create-user.dto';
import { UpdateUserDto } from '../application/dto/update-user.dto';
import { AssignRolesDto } from '../application/dto/assign-roles.dto';
import { UserResponseDto } from '../application/dto/user-response.dto';
import { PaginationDto, PaginatedResponseDto } from '../../../shared/dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserResponseDto>> {
    return this.userService.findAll(paginationDto);
  }

  @Get('active')
  async findActive(): Promise<UserResponseDto[]> {
    return this.userService.findActive();
  }

  @Get('count')
  async count(): Promise<{ count: number }> {
    const count = await this.userService.count();
    return { count };
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<UserResponseDto> {
    return this.userService.findByEmail(email);
  }

  @Get('role/:roleName')
  async findByRole(@Param('roleName') roleName: string): Promise<UserResponseDto[]> {
    return this.userService.findByRole(roleName);
  }

  @Get('exists/:email')
  async existsByEmail(@Param('email') email: string): Promise<{ exists: boolean }> {
    const exists = await this.userService.existsByEmail(email);
    return { exists };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/roles')
  async assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignRolesDto: AssignRolesDto,
  ): Promise<UserResponseDto> {
    return this.userService.assignRoles(id, assignRolesDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }
}
