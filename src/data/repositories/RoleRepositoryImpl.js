import { RoleRepository } from './RoleRepository'
import { Role } from '../../domain/entities/Role'

export class RoleRepositoryImpl extends RoleRepository {
  constructor(roleApiDataSource) {
    super()
    this.roleApiDataSource = roleApiDataSource
  }
  async getAll() {
    const raw = await this.roleApiDataSource.fetchRoles()
    return raw.map(r => new Role({ id: r.id, name: r.name }))
  }
  async create({ name }) {
    const r = await this.roleApiDataSource.createRole({ name })
    return new Role({ id: r.id, name: r.name })
  }
  async update(id, { name }) {
    const r = await this.roleApiDataSource.updateRole(id, { name })
    return new Role({ id: r.id, name: r.name })
  }
  async delete(id) {
    const r = await this.roleApiDataSource.deleteRole(id)
    return new Role({ id: r.id, name: r.name })
  }
}

