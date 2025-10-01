import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from '../domain/entities/role.entity';
import { RoleRepositoryInterface } from '../domain/repositories/role.repository.interface';

@Injectable()
export class RoleRepository implements RoleRepositoryInterface {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<Role | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByIds(ids: number[]): Promise<Role[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    return this.repository.findBy({ id: In(ids) });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.repository.findOne({ where: { name } });
  }

  async create(role: Partial<Role>): Promise<Role> {
    const newRole = this.repository.create(role);
    return this.repository.save(newRole);
  }

  async update(id: number, role: Partial<Role>): Promise<Role> {
    await this.repository.update(id, role);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findActive(): Promise<Role[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findByPermission(permission: string): Promise<Role[]> {
    return this.repository
      .createQueryBuilder('role')
      .where('JSON_CONTAINS(role.permissions, :permission)', { permission: `"${permission}"` })
      .getMany();
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.repository.count({ where: { name } });
    return count > 0;
  }
}
