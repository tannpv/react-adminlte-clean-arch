export class UpdateRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository
  }
  async execute(id, { name }) {
    return await this.roleRepository.update(id, { name })
  }
}

