import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../../shared/kernel';

@Entity('customers')
export class Customer extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'json', nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Column({ type: 'json', nullable: true })
  preferences: Record<string, any>;
}
