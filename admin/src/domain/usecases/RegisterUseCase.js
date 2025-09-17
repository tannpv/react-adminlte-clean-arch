export class RegisterUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository
  }
  async execute({ name, email, password }) {
    return await this.authRepository.register({ name, email, password })
  }
}

