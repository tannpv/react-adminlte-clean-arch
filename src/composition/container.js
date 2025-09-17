import { ApiClient } from '../infra/http/ApiClient'
import { UserApiDataSource } from '../data/sources/UserApiDataSource'
import { UserRepositoryImpl } from '../data/repositories/UserRepositoryImpl'
import { GetUsersUseCase } from '../domain/usecases/GetUsersUseCase'
import { AuthApiDataSource } from '../data/sources/AuthApiDataSource'
import { AuthRepositoryImpl } from '../data/repositories/AuthRepositoryImpl'
import { LoginUseCase } from '../domain/usecases/LoginUseCase'
import { RegisterUseCase } from '../domain/usecases/RegisterUseCase'
import { CreateUserUseCase } from '../domain/usecases/CreateUserUseCase'
import { UpdateUserUseCase } from '../domain/usecases/UpdateUserUseCase'
import { DeleteUserUseCase } from '../domain/usecases/DeleteUserUseCase'
import { RoleApiDataSource } from '../data/sources/RoleApiDataSource'
import { RoleRepositoryImpl } from '../data/repositories/RoleRepositoryImpl'
import { GetRolesUseCase } from '../domain/usecases/GetRolesUseCase'
import { CreateRoleUseCase } from '../domain/usecases/CreateRoleUseCase'
import { UpdateRoleUseCase } from '../domain/usecases/UpdateRoleUseCase'
import { DeleteRoleUseCase } from '../domain/usecases/DeleteRoleUseCase'

const userApiDS = new UserApiDataSource(ApiClient)
const userRepo = new UserRepositoryImpl(userApiDS)
export const getUsersUseCase = new GetUsersUseCase(userRepo)
export const createUserUseCase = new CreateUserUseCase(userRepo)
export const updateUserUseCase = new UpdateUserUseCase(userRepo)
export const deleteUserUseCase = new DeleteUserUseCase(userRepo)

const authApiDS = new AuthApiDataSource(ApiClient)
const authRepo = new AuthRepositoryImpl(authApiDS)
export const loginUseCase = new LoginUseCase(authRepo)
export const registerUseCase = new RegisterUseCase(authRepo)

// Roles wiring
const roleApiDS = new RoleApiDataSource(ApiClient)
const roleRepo = new RoleRepositoryImpl(roleApiDS)
export const getRolesUseCase = new GetRolesUseCase(roleRepo)
export const createRoleUseCase = new CreateRoleUseCase(roleRepo)
export const updateRoleUseCase = new UpdateRoleUseCase(roleRepo)
export const deleteRoleUseCase = new DeleteRoleUseCase(roleRepo)
