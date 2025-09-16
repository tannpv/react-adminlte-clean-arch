export class UpdateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository
  }
  async execute(id, { name, email }) {
    return await this.userRepository.update(id, { name, email })
  }
}

