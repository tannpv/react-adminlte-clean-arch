import { Carrier } from '../entities/carrier.entity';

export interface CarrierRepositoryInterface {
  findAll(): Promise<Carrier[]>;
  findById(id: number): Promise<Carrier | null>;
  findByName(name: string): Promise<Carrier | null>;
  create(carrier: Partial<Carrier>): Promise<Carrier>;
  update(id: number, carrier: Partial<Carrier>): Promise<Carrier>;
  delete(id: number): Promise<void>;
  findActive(): Promise<Carrier[]>;
}
