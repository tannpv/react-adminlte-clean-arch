export class AuthApiDataSource {
  constructor(apiClient) {
    this.apiClient = apiClient
  }
  async login({ email, password }) {
    const res = await this.apiClient.post('/auth/login', { email, password })
    return res.data
  }
  async register({ name, email, password }) {
    const res = await this.apiClient.post('/auth/register', { name, email, password })
    return res.data
  }
}

