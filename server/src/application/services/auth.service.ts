import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { RegisterDto } from '../dto/register.dto'
import { LoginDto } from '../dto/login.dto'
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository'
import { RoleRepository, ROLE_REPOSITORY } from '../../domain/repositories/role.repository'
import { PasswordService } from '../../shared/password.service'
import { TokenService } from '../../shared/token.service'
import { User } from '../../domain/entities/user.entity'

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto) {
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
      user: created.toPublic(),
    }
  }

  async login(dto: LoginDto) {
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
      user: user.toPublic(),
    }
  }

  private async findDefaultUserRoleId(): Promise<number | null> {
    const byName = await this.roles.findByName('User')
    if (byName) return byName.id
    const fallback = await this.roles.findById(2)
    return fallback ? fallback.id : null
  }
}
