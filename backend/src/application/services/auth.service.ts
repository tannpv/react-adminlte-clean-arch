import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { RegisterDto } from '../dto/register.dto'
import { LoginDto } from '../dto/login.dto'
import { USER_REPOSITORY, UserRepository } from '../../domain/repositories/user.repository'
import { RoleRepository, ROLE_REPOSITORY } from '../../domain/repositories/role.repository'
import { PasswordService } from '../../shared/password.service'
import { TokenService } from '../../shared/token.service'
import { User } from '../../domain/entities/user.entity'
import { UserProfile } from '../../domain/entities/user-profile.entity'

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto) {
    const trimmedFirstName = dto.firstName.trim()
    const trimmedLastName = dto.lastName.trim()
    const trimmedEmail = dto.email.trim()
    const emailLower = trimmedEmail.toLowerCase()

    if (!trimmedFirstName || trimmedFirstName.length < 2) {
      throw new ConflictException({ message: 'First name is too short' })
    }

    if (!trimmedLastName || trimmedLastName.length < 2) {
      throw new ConflictException({ message: 'Last name is too short' })
    }

    const existing = await this.users.findByEmail(emailLower)
    if (existing) {
      throw new ConflictException({ message: 'Email already in use' })
    }

    let dateOfBirth: Date | null = null
    if (dto.dateOfBirth) {
      const dob = new Date(dto.dateOfBirth)
      if (Number.isNaN(dob.getTime())) {
        throw new ConflictException({ message: 'Date of birth is invalid' })
      }
      dateOfBirth = dob
    }

    const passwordHash = await this.passwordService.hash(dto.password)
    const id = await this.users.nextId()

    const defaultRole = await this.findDefaultUserRoleId()
    const user = new User(id, trimmedEmail, defaultRole ? [defaultRole] : [], passwordHash)
    user.profile = new UserProfile({
      userId: id,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      dateOfBirth,
      pictureUrl: dto.pictureUrl ? dto.pictureUrl.trim() || null : null,
    })
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
