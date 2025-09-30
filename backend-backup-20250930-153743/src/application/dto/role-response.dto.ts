import { Permission } from '../../domain/value-objects/permission.type'

export interface RoleResponseDto {
  id: number
  name: string
  permissions: Permission[]
}
