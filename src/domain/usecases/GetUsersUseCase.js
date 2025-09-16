export class GetUsersUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository
  }
  async execute() {
    return await this.userRepository.getAll()
  }
}
