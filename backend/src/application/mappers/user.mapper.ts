import { PublicUser, User } from '../../domain/entities/user.entity'
import { UserResponseDto } from '../dto/user-response.dto'

export function toUserResponse(user: User | PublicUser): UserResponseDto {
  const source: PublicUser = user instanceof User ? user.toPublic() : user
  return {
    id: source.id,
    name: source.name,
    email: source.email,
    roles: [...source.roles],
  }
}
