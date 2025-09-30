import { User } from '../entities/user.entity';

export interface UserRepositoryInterface {
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  update(id: number, user: Partial<User>): Promise<User>;
  delete(id: number): Promise<void>;
  findActive(): Promise<User[]>;
  findByRole(roleName: string): Promise<User[]>;
  findWithRoles(): Promise<User[]>;
  count(): Promise<number>;
  existsByEmail(email: string): Promise<boolean>;
  findPaginated(page: number, limit: number, search?: string): Promise<{ users: User[]; total: number }>;
}
