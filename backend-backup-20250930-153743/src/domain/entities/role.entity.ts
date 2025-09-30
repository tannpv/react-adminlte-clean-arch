import { Permission } from '../value-objects/permission.type'

export class Role {
  constructor(
    public readonly id: number,
    public name: string,
    public permissions: Permission[] = [],
  ) {}

  clone(): Role {
    return new Role(this.id, this.name, [...this.permissions])
  }
}
