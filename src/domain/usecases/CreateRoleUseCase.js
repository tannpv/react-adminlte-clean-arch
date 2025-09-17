export class CreateRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository
  }
  async execute({ name }) {
    return await this.roleRepository.create({ name })
  }
}

