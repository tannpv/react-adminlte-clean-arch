export class RoleApiDataSource {
  constructor(apiClient) {
    this.apiClient = apiClient
  }
  async fetchRoles() {
    const res = await this.apiClient.get('/roles')
    return res.data
  }
  async createRole({ name }) {
    const res = await this.apiClient.post('/roles', { name })
    return res.data
  }
  async updateRole(id, { name }) {
    const res = await this.apiClient.put(`/roles/${id}`, { name })
    return res.data
  }
  async deleteRole(id) {
    const res = await this.apiClient.delete(`/roles/${id}`)
    return res.data
  }
}

