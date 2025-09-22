import { Attribute } from "../entities/attribute.entity";

export interface AttributeRepository {
  findAll(): Promise<Attribute[]>;
  findById(id: number): Promise<Attribute | null>;
  findByCode(code: string): Promise<Attribute | null>;
  create(attribute: Attribute): Promise<Attribute>;
  update(attribute: Attribute): Promise<Attribute>;
  delete(id: number): Promise<void>;
  existsByCode(code: string, excludeId?: number): Promise<boolean>;
}
