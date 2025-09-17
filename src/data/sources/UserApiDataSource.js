export class UserApiDataSource {
  constructor(apiClient) {
    this.apiClient = apiClient
  }
  async fetchUsers() {
    const res = await this.apiClient.get('/users')
    return res.data
  }
  async createUser({ name, email, roles }) {
    const res = await this.apiClient.post('/users', { name, email, roles })
    return res.data
  }
  async updateUser(id, { name, email, roles }) {
    const res = await this.apiClient.put(`/users/${id}`, { name, email, roles })
    return res.data
  }
  async deleteUser(id) {
    const res = await this.apiClient.delete(`/users/${id}`)
    return res.data
  }
}
