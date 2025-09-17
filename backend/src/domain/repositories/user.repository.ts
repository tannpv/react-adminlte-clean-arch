import { User } from '../entities/user.entity'

export interface UserRepository {
  findAll(): Promise<User[]>
  findById(id: number): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(user: User): Promise<User>
  update(user: User): Promise<User>
  remove(id: number): Promise<User | null>
  nextId(): Promise<number>
}

export const USER_REPOSITORY = 'USER_REPOSITORY'
