import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ROLE_REPOSITORY, RoleRepository } from '../../domain/repositories/role.repository'
import { CreateRoleDto } from '../dto/create-role.dto'
import { UpdateRoleDto } from '../dto/update-role.dto'
import { validationException } from '../../shared/validation-error'
import { Role } from '../../domain/entities/role.entity'

@Injectable()
export class RolesService {
  constructor(@Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository) {}

  async list(): Promise<Role[]> {
    return this.roles.findAll()
  }

  async findMany(ids: number[]): Promise<Role[]> {
    return this.roles.findByIds(ids)
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const name = dto.name.trim()
    if (!name || name.length < 2) {
      throw validationException({
        name: { code: 'NAME_MIN', message: 'Name is required (min 2 characters)' },
      })
    }

    const existing = await this.roles.findByName(name)
    if (existing) {
      throw validationException({
        name: { code: 'NAME_EXISTS', message: 'Role name already exists' },
      })
    }

    const id = await this.roles.nextId()
    const role = new Role(id, name, Array.isArray(dto.permissions) ? dto.permissions : [])
    return this.roles.create(role)
  }

  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    const existing = await this.roles.findById(id)
    if (!existing) throw new NotFoundException({ message: 'Not found' })

    if (dto.name !== undefined) {
      const name = dto.name.trim()
      if (!name || name.length < 2) {
        throw validationException({
          name: { code: 'NAME_MIN', message: 'Name is required (min 2 characters)' },
        })
      }
      const conflict = await this.roles.findByName(name)
      if (conflict && conflict.id !== id) {
        throw validationException({
          name: { code: 'NAME_EXISTS', message: 'Role name already exists' },
        })
      }
      existing.name = name
    }

    if (dto.permissions !== undefined) {
      existing.permissions = Array.isArray(dto.permissions) ? [...dto.permissions] : []
    }

    return this.roles.update(existing)
  }

  async remove(id: number): Promise<Role> {
    const removed = await this.roles.remove(id)
    if (!removed) throw new NotFoundException({ message: 'Not found' })
    return removed
  }
}
