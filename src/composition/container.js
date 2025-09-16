import { ApiClient } from '../infra/http/ApiClient'
import { UserApiDataSource } from '../data/sources/UserApiDataSource'
import { UserRepositoryImpl } from '../data/repositories/UserRepositoryImpl'
import { GetUsersUseCase } from '../domain/usecases/GetUsersUseCase'
import { CreateUserUseCase } from '../domain/usecases/CreateUserUseCase'
import { UpdateUserUseCase } from '../domain/usecases/UpdateUserUseCase'
import { DeleteUserUseCase } from '../domain/usecases/DeleteUserUseCase'

const userApiDS = new UserApiDataSource(ApiClient)
const userRepo = new UserRepositoryImpl(userApiDS)
export const getUsersUseCase = new GetUsersUseCase(userRepo)
export const createUserUseCase = new CreateUserUseCase(userRepo)
export const updateUserUseCase = new UpdateUserUseCase(userRepo)
export const deleteUserUseCase = new DeleteUserUseCase(userRepo)
