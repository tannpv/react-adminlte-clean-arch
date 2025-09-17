import { UserRepository } from './UserRepository'
import { User } from '../../domain/entities/User'

export class UserRepositoryImpl extends UserRepository {
  constructor(userApiDataSource) {
    super()
    this.userApiDataSource = userApiDataSource
  }
  async getAll() {
    const raw = await this.userApiDataSource.fetchUsers()
    return raw.map(r => new User({ id: r.id, name: r.name, email: r.email, roles: r.roles || [] }))
  }
  async create({ name, email, roles }) {
    const r = await this.userApiDataSource.createUser({ name, email, roles })
    return new User({ id: r.id, name: r.name, email: r.email, roles: r.roles || [] })
  }
  async update(id, { name, email, roles }) {
    const r = await this.userApiDataSource.updateUser(id, { name, email, roles })
    return new User({ id: r.id, name: r.name, email: r.email, roles: r.roles || [] })
  }
  async delete(id) {
    const r = await this.userApiDataSource.deleteUser(id)
    return new User({ id: r.id, name: r.name, email: r.email, roles: r.roles || [] })
  }
}
