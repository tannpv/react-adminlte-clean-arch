import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CreateUserDto } from '../dto/create-user.dto'
import { UpdateUserDto } from '../dto/update-user.dto'
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository'
import { ROLE_REPOSITORY, RoleRepository } from '../../domain/repositories/role.repository'
import { PublicUser, User } from '../../domain/entities/user.entity'
import { PasswordService } from '../../shared/password.service'
import { DEFAULT_USER_PASSWORD } from '../../shared/constants'
import { validationException } from '../../shared/validation-error'

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async list(): Promise<PublicUser[]> {
    const users = await this.users.findAll()
    return users.map((user) => user.toPublic())
  }

  async findById(id: number): Promise<PublicUser> {
    const user = await this.users.findById(id)
    if (!user) throw new NotFoundException({ message: 'Not found' })
    return user.toPublic()
  }

  async findDomainById(id: number): Promise<User | null> {
    return this.users.findById(id)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.findByEmail(email)
  }

  async create(dto: CreateUserDto): Promise<PublicUser> {
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
    return created.toPublic()
  }

  async update(id: number, dto: UpdateUserDto): Promise<PublicUser> {
    const existing = await this.users.findById(id)
    if (!existing) throw new NotFoundException({ message: 'Not found' })

    const updates: Partial<User> & { passwordHash?: string } = {}

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

    if (dto.password !== undefined) {
      if (!dto.password.trim()) {
        throw validationException({
          password: { code: 'PASSWORD_REQUIRED', message: 'Password must be at least 6 characters' },
        })
      }
      if (dto.password.length < 6) {
        throw validationException({
          password: { code: 'PASSWORD_MIN', message: 'Password must be at least 6 characters' },
        })
      }
      updates.passwordHash = this.passwordService.hashSync(dto.password)
    }

    const updated = existing.clone()
    updated.name = updates.name ?? updated.name
    updated.email = updates.email ?? updated.email
    updated.roles = updates.roles ?? updated.roles
    if (updates.passwordHash) {
      updated.passwordHash = updates.passwordHash
    }

    const saved = await this.users.update(updated)
    return saved.toPublic()
  }

  async remove(id: number): Promise<PublicUser> {
    const removed = await this.users.remove(id)
    if (!removed) throw new NotFoundException({ message: 'Not found' })
    return removed.toPublic()
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

    const found = await this.roles.findByIds(cleaned)
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
