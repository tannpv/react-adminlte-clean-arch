export class CreateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository
  }
  async execute({ name, email, roles }) {
    return await this.userRepository.create({ name, email, roles })
  }
}
