export class DeleteRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository
  }
  async execute(id) {
    return await this.roleRepository.delete(id)
  }
}

