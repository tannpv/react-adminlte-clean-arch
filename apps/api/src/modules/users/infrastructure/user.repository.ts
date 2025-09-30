import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/entities/user.entity';
import { UserRepositoryInterface } from '../domain/repositories/user.repository.interface';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.repository.find({
      relations: ['roles'],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.repository.create(user);
    return this.repository.save(newUser);
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    await this.repository.update(id, user);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findActive(): Promise<User[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['roles'],
      order: { firstName: 'ASC' },
    });
  }

  async findByRole(roleName: string): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .where('roles.name = :roleName', { roleName })
      .getMany();
  }

  async findWithRoles(): Promise<User[]> {
    return this.repository.find({
      relations: ['roles'],
    });
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }

  async findPaginated(page: number, limit: number, search?: string): Promise<{ users: User[]; total: number }> {
    const queryBuilder = this.repository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles');
    
    if (search) {
      queryBuilder.where(
        'user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search',
        { search: `%${search}%` }
      );
    }
    
    const [users, total] = await queryBuilder
      .orderBy('user.firstName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    
    return { users, total };
  }
}
