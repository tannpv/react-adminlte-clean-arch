import { Attribute } from "./attribute.entity";

export class AttributeSet {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string | null,
    public readonly isSystem: boolean,
    public readonly sortOrder: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly attributes: Attribute[] = []
  ) {}

  static create(
    name: string,
    description?: string | null,
    isSystem: boolean = false,
    sortOrder: number = 0
  ): AttributeSet {
    const now = new Date();
    return new AttributeSet(
      0, // Will be set by database
      name,
      description || null,
      isSystem,
      sortOrder,
      now,
      now,
      []
    );
  }

  update(
    name?: string,
    description?: string | null,
    isSystem?: boolean,
    sortOrder?: number
  ): AttributeSet {
    return new AttributeSet(
      this.id,
      name ?? this.name,
      description !== undefined ? description : this.description,
      isSystem ?? this.isSystem,
      sortOrder ?? this.sortOrder,
      this.createdAt,
      new Date(),
      this.attributes
    );
  }

  addAttribute(attribute: Attribute): AttributeSet {
    const updatedAttributes = [...this.attributes, attribute];
    return new AttributeSet(
      this.id,
      this.name,
      this.description,
      this.isSystem,
      this.sortOrder,
      this.createdAt,
      new Date(),
      updatedAttributes
    );
  }

  removeAttribute(attributeId: number): AttributeSet {
    const updatedAttributes = this.attributes.filter(
      (attr) => attr.id !== attributeId
    );
    return new AttributeSet(
      this.id,
      this.name,
      this.description,
      this.isSystem,
      this.sortOrder,
      this.createdAt,
      new Date(),
      updatedAttributes
    );
  }

  hasAttribute(attributeId: number): boolean {
    return this.attributes.some((attr) => attr.id === attributeId);
  }

  getAttributeCount(): number {
    return this.attributes.length;
  }
}
