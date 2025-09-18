import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ROLE_REPOSITORY, RoleRepository } from '../../domain/repositories/role.repository'
import { CreateRoleDto } from '../dto/create-role.dto'
import { UpdateRoleDto } from '../dto/update-role.dto'
import { validationException } from '../../shared/validation-error'
import { Role } from '../../domain/entities/role.entity'
import { DomainEventBus } from '../../shared/events/domain-event.bus'
import { RoleCreatedEvent } from '../../domain/events/role-created.event'
import { RoleUpdatedEvent } from '../../domain/events/role-updated.event'
import { RoleRemovedEvent } from '../../domain/events/role-removed.event'
import { toRoleResponse } from '../mappers/role.mapper'
import { RoleResponseDto } from '../dto/role-response.dto'

@Injectable()
export class RolesService {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    private readonly events: DomainEventBus,
  ) {}

  async list(): Promise<RoleResponseDto[]> {
    const roles = await this.roles.findAll()
    return roles.map((role) => toRoleResponse(role))
  }

  async findMany(ids: number[]): Promise<Role[]> {
    return this.roles.findByIds(ids)
  }

  async findByNameDomain(name: string): Promise<Role | null> {
    return this.roles.findByName(name)
  }

  async findByIdDomain(id: number): Promise<Role | null> {
    return this.roles.findById(id)
  }

  async create(dto: CreateRoleDto): Promise<RoleResponseDto> {
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
    const created = await this.roles.create(role)
    this.events.publish(new RoleCreatedEvent(created))
    return toRoleResponse(created)
  }

  async update(id: number, dto: UpdateRoleDto): Promise<RoleResponseDto> {
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

    const updated = await this.roles.update(existing)
    this.events.publish(new RoleUpdatedEvent(updated))
    return toRoleResponse(updated)
  }

  async remove(id: number): Promise<RoleResponseDto> {
    const removed = await this.roles.remove(id)
    if (!removed) throw new NotFoundException({ message: 'Not found' })
    this.events.publish(new RoleRemovedEvent(removed))
    return toRoleResponse(removed)
  }
}
