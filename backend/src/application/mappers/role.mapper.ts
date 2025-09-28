import { Role } from '../../domain/entities/role.entity'
import { RoleResponseDto } from '../dto/role-response.dto'

export function toRoleResponse(role: Role): RoleResponseDto {
  return {
    id: role.id,
    name: role.name,
    permissions: [...role.permissions],
  }
}
