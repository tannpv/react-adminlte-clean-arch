import { User } from '../../domain/entities/user.entity'
import { UserResponseDto } from '../dto/user-response.dto'

export function toUserResponse(user: User): UserResponseDto {
  const publicUser = user.toPublic()
  return {
    id: publicUser.id,
    email: publicUser.email,
    roles: [...publicUser.roles],
    profile: publicUser.profile ? { ...publicUser.profile } : null,
  }
}
