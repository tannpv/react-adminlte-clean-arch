import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../../shared/kernel';

@Entity('carriers')
export class Carrier extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;
}
