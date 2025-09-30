import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../../shared/kernel';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  permissions: string[];

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  // Many-to-many relationship with users (handled in User entity)
  // Note: The relationship is defined in User entity to avoid circular imports
}
