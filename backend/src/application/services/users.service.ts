import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CreateUserDto } from '../dto/create-user.dto'
import { UpdateUserDto } from '../dto/update-user.dto'
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository'
import { User } from '../../domain/entities/user.entity'
import { PasswordService } from '../../shared/password.service'
import { DEFAULT_USER_PASSWORD } from '../../shared/constants'
import { validationException } from '../../shared/validation-error'
import { DomainEventBus } from '../../shared/events/domain-event.bus'
import { UserCreatedEvent } from '../../domain/events/user-created.event'
import { UserUpdatedEvent } from '../../domain/events/user-updated.event'
import { UserRemovedEvent } from '../../domain/events/user-removed.event'
import { toUserResponse } from '../mappers/user.mapper'
import { UserResponseDto } from '../dto/user-response.dto'
import { RolesService } from './roles.service'

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly rolesService: RolesService,
    private readonly passwordService: PasswordService,
    private readonly events: DomainEventBus,
  ) {}

  async list(): Promise<UserResponseDto[]> {
    const users = await this.users.findAll()
    return users.map((user) => toUserResponse(user))
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.users.findById(id)
    if (!user) throw new NotFoundException({ message: 'Not found' })
    return toUserResponse(user)
  }

  async findDomainById(id: number): Promise<User | null> {
    return this.users.findById(id)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.findByEmail(email)
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const trimmedName = dto.name.trim()
    const trimmedEmail = dto.email.trim()
    const emailLower = trimmedEmail.toLowerCase()

    if (!trimmedName || trimmedName.length < 2) {
      throw validationException({
        name: { code: 'NAME_MIN', message: 'Name is required (min 2 characters)' },
      })
    }

    if (!trimmedEmail) {
      throw validationException({
        email: { code: 'EMAIL_REQUIRED', message: 'Email is required' },
      })
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(trimmedEmail)) {
      throw validationException({
        email: { code: 'EMAIL_INVALID', message: 'Email is invalid' },
      })
    }

    const existingByEmail = await this.users.findByEmail(emailLower)
    if (existingByEmail) {
      throw validationException({
        email: { code: 'EMAIL_EXISTS', message: 'Email is already in use' },
      })
    }

    const roleIds = await this.validateRoles(dto.roles)

    const id = await this.users.nextId()
    const passwordHash = this.passwordService.hashSync(DEFAULT_USER_PASSWORD)
    const user = new User(id, trimmedName, trimmedEmail, roleIds, passwordHash)
    const created = await this.users.create(user)
    this.events.publish(new UserCreatedEvent(created))
    return toUserResponse(created)
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    const existing = await this.users.findById(id)
    if (!existing) throw new NotFoundException({ message: 'Not found' })

    const updates: Partial<User> = {}

    if (dto.name !== undefined) {
      const trimmed = dto.name.trim()
      if (!trimmed || trimmed.length < 2) {
        throw validationException({
          name: { code: 'NAME_MIN', message: 'Name is required (min 2 characters)' },
        })
      }
      updates.name = trimmed
    }

    if (dto.email !== undefined) {
      const trimmedEmail = dto.email.trim()
      if (!trimmedEmail) {
        throw validationException({
          email: { code: 'EMAIL_REQUIRED', message: 'Email is required' },
        })
      }
      const emailLower = trimmedEmail.toLowerCase()
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRe.test(trimmedEmail)) {
        throw validationException({
          email: { code: 'EMAIL_INVALID', message: 'Email is invalid' },
        })
      }
      const conflict = await this.users.findByEmail(emailLower)
      if (conflict && conflict.id !== id) {
        throw validationException({
          email: { code: 'EMAIL_EXISTS', message: 'Email is already in use' },
        })
      }
      updates.email = trimmedEmail
    }

    if (dto.roles !== undefined) {
      const roleIds = await this.validateRoles(dto.roles)
      updates.roles = roleIds
    }

    const updated = existing.clone()
    updated.name = updates.name ?? updated.name
    updated.email = updates.email ?? updated.email
    updated.roles = updates.roles ?? updated.roles

    const saved = await this.users.update(updated)
    this.events.publish(new UserUpdatedEvent(saved))
    return toUserResponse(saved)
  }

  async remove(id: number): Promise<UserResponseDto> {
    const removed = await this.users.remove(id)
    if (!removed) throw new NotFoundException({ message: 'Not found' })
    this.events.publish(new UserRemovedEvent(removed))
    return toUserResponse(removed)
  }

  private async validateRoles(roles?: number[]): Promise<number[]> {
    if (roles === undefined) return []
    if (!Array.isArray(roles)) {
      throw validationException({
        roles: { code: 'ROLES_INVALID', message: 'Invalid roles selected' },
      })
    }

    const cleaned = roles.filter((roleId) => Number.isInteger(roleId))
    if (!cleaned.length) return []

    const found = await this.rolesService.findMany(cleaned)
    const foundIds = new Set(found.map((role) => role.id))
    const missing = cleaned.filter((roleId) => !foundIds.has(roleId))
    if (missing.length) {
      throw validationException({
        roles: { code: 'ROLES_INVALID', message: 'Invalid roles selected' },
      })
    }
    return cleaned
  }
}
