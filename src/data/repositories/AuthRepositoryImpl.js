import { AuthRepository } from './AuthRepository'
import { User } from '../../domain/entities/User'

export class AuthRepositoryImpl extends AuthRepository {
  constructor(authApiDataSource) {
    super()
    this.authApiDataSource = authApiDataSource
  }
  async login({ email, password }) {
    const { token, user } = await this.authApiDataSource.login({ email, password })
    return { token, user: new User({ id: user.id, name: user.name, email: user.email }) }
  }
  async register({ name, email, password }) {
    const { token, user } = await this.authApiDataSource.register({ name, email, password })
    return { token, user: new User({ id: user.id, name: user.name, email: user.email }) }
  }
}

