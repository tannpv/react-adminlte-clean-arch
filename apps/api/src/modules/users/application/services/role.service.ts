import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../domain/entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RoleResponseDto } from '../dto/user-response.dto';
import { PaginationDto, PaginatedResponseDto } from '../../../../shared/dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    // Check if role with same name already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const role = this.roleRepository.create(createRoleDto);
    const savedRole = await this.roleRepository.save(role);
    
    return new RoleResponseDto(savedRole);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<RoleResponseDto>> {
    const { page = 1, limit = 10, search, sortBy = 'name', sortOrder = 'ASC' } = paginationDto;
    
    const queryBuilder = this.roleRepository.createQueryBuilder('role');
    
    if (search) {
      queryBuilder.where(
        'role.name ILIKE :search OR role.description ILIKE :search',
        { search: `%${search}%` }
      );
    }
    
    queryBuilder
      .orderBy(`role.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);
    
    const [roles, total] = await queryBuilder.getManyAndCount();
    
    const roleResponses = roles.map(role => new RoleResponseDto(role));
    
    return new PaginatedResponseDto(roleResponses, total, page, limit);
  }

  async findOne(id: number): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({ where: { id } });
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    
    return new RoleResponseDto(role);
  }

  async findByName(name: string): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({ where: { name } });
    
    if (!role) {
      throw new NotFoundException(`Role with name ${name} not found`);
    }
    
    return new RoleResponseDto(role);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({ where: { id } });
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Check if name is being updated and if it conflicts
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    Object.assign(role, updateRoleDto);
    const updatedRole = await this.roleRepository.save(role);
    
    return new RoleResponseDto(updatedRole);
  }

  async remove(id: number): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { id } });
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    await this.roleRepository.remove(role);
  }

  async findActive(): Promise<RoleResponseDto[]> {
    const roles = await this.roleRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
    
    return roles.map(role => new RoleResponseDto(role));
  }

  async findByPermission(permission: string): Promise<RoleResponseDto[]> {
    const roles = await this.roleRepository
      .createQueryBuilder('role')
      .where('JSON_CONTAINS(role.permissions, :permission)', { permission: `"${permission}"` })
      .getMany();
    
    return roles.map(role => new RoleResponseDto(role));
  }

  async count(): Promise<number> {
    return this.roleRepository.count();
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.roleRepository.count({ where: { name } });
    return count > 0;
  }
}
