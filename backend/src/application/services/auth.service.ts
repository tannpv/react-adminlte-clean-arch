import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { RegisterDto } from '../dto/register.dto'
import { LoginDto } from '../dto/login.dto'
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository'
import { PasswordService } from '../../shared/password.service'
import { TokenService } from '../../shared/token.service'
import { User } from '../../domain/entities/user.entity'
import { toUserResponse } from '../mappers/user.mapper'
import { AuthResponseDto } from '../dto/auth-response.dto'
import { RolesService } from './roles.service'

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly rolesService: RolesService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const trimmedName = dto.name.trim()
    const trimmedEmail = dto.email.trim()
    const emailLower = trimmedEmail.toLowerCase()

    const existing = await this.users.findByEmail(emailLower)
    if (existing) {
      throw new ConflictException({ message: 'Email already in use' })
    }

    const passwordHash = await this.passwordService.hash(dto.password)
    const id = await this.users.nextId()

    const defaultRole = await this.findDefaultUserRoleId()
    const user = new User(id, trimmedName, trimmedEmail, defaultRole ? [defaultRole] : [], passwordHash)
    const created = await this.users.create(user)

    const token = this.tokenService.sign(created.id)
    return {
      token,
      user: toUserResponse(created),
    }
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const emailLower = dto.email.trim().toLowerCase()
    const user = await this.users.findByEmail(emailLower)
    if (!user) {
      throw new UnauthorizedException({ message: 'Invalid credentials' })
    }

    const passwordOk = await this.passwordService.compare(dto.password, user.passwordHash)
    if (!passwordOk) {
      throw new UnauthorizedException({ message: 'Invalid credentials' })
    }

    const token = this.tokenService.sign(user.id)
    return {
      token,
      user: toUserResponse(user),
    }
  }

  private async findDefaultUserRoleId(): Promise<number | null> {
    const byName = await this.rolesService.findByNameDomain('User')
    if (byName) return byName.id
    const fallback = await this.rolesService.findByIdDomain(2)
    return fallback ? fallback.id : null
  }
}
