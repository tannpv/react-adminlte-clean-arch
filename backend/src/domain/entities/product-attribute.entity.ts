export type ProductAttributeInputType = 'select' | 'text'

export interface ProductAttributeTermProps {
  id: number
  attributeId: number
  name: string
  slug: string
  order: number
  metadata?: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
}

export class ProductAttributeTerm {
  constructor(private props: ProductAttributeTermProps) {}

  get id() { return this.props.id }
  get attributeId() { return this.props.attributeId }
  get name() { return this.props.name }
  set name(value: string) { this.props.name = value }
  get slug() { return this.props.slug }
  set slug(value: string) { this.props.slug = value }
  get order() { return this.props.order }
  set order(value: number) { this.props.order = value }
  get metadata() { return this.props.metadata ?? null }
  set metadata(value: Record<string, unknown> | null | undefined) { this.props.metadata = value ?? null }
  get createdAt() { return this.props.createdAt }
  set createdAt(value: Date) { this.props.createdAt = value }
  get updatedAt() { return this.props.updatedAt }
  set updatedAt(value: Date) { this.props.updatedAt = value }

  clone(): ProductAttributeTerm {
    return new ProductAttributeTerm({
      ...this.props,
      metadata: this.props.metadata ? { ...this.props.metadata } : null,
    })
  }
}

export interface ProductAttributeDefinitionProps {
  id: number
  name: string
  slug: string
  description?: string | null
  inputType: ProductAttributeInputType
  terms: ProductAttributeTerm[]
  createdAt: Date
  updatedAt: Date
}

export class ProductAttributeDefinition {
  constructor(private props: ProductAttributeDefinitionProps) {}

  get id() { return this.props.id }
  get name() { return this.props.name }
  set name(value: string) { this.props.name = value }
  get slug() { return this.props.slug }
  set slug(value: string) { this.props.slug = value }
  get description() { return this.props.description ?? null }
  set description(value: string | null | undefined) { this.props.description = value ?? null }
  get inputType() { return this.props.inputType }
  set inputType(value: ProductAttributeInputType) { this.props.inputType = value }
  get terms() { return this.props.terms.map((term) => term.clone()) }
  set terms(value: ProductAttributeTerm[]) { this.props.terms = value.map((term) => term.clone()) }
  get createdAt() { return this.props.createdAt }
  set createdAt(value: Date) { this.props.createdAt = value }
  get updatedAt() { return this.props.updatedAt }
  set updatedAt(value: Date) { this.props.updatedAt = value }

  clone(): ProductAttributeDefinition {
    return new ProductAttributeDefinition({
      ...this.props,
      terms: this.props.terms.map((term) => term.clone()),
    })
  }
}
