import { AttributeSet } from "../entities/attribute-set.entity";

export interface AttributeSetRepository {
  findAll(): Promise<AttributeSet[]>;
  findById(id: number): Promise<AttributeSet | null>;
  findByName(name: string): Promise<AttributeSet | null>;
  create(attributeSet: AttributeSet): Promise<AttributeSet>;
  update(attributeSet: AttributeSet): Promise<AttributeSet>;
  delete(id: number): Promise<void>;
  existsByName(name: string, excludeId?: number): Promise<boolean>;
}
