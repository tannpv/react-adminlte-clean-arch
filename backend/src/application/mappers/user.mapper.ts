import { User } from '../../domain/entities/user.entity'
import { UserResponseDto } from '../dto/user-response.dto'

export function toUserResponse(user: User): UserResponseDto {
  const publicUser = user.toPublic()
  return {
    id: publicUser.id,
    name: publicUser.name,
    email: publicUser.email,
    roles: [...publicUser.roles],
  }
}
