import { ProductAttributeDefinition } from './product-attribute.entity'

export interface ProductAttributeSetProps {
  id: number
  name: string
  slug: string
  description?: string | null
  attributes: ProductAttributeDefinition[]
  createdAt: Date
  updatedAt: Date
}

export class ProductAttributeSet {
  constructor(private props: ProductAttributeSetProps) {}

  get id() { return this.props.id }
  get name() { return this.props.name }
  set name(value: string) { this.props.name = value }
  get slug() { return this.props.slug }
  set slug(value: string) { this.props.slug = value }
  get description() { return this.props.description ?? null }
  set description(value: string | null | undefined) { this.props.description = value ?? null }
  get attributes() { return this.props.attributes.map((attribute) => attribute.clone()) }
  set attributes(value: ProductAttributeDefinition[]) { this.props.attributes = value.map((attribute) => attribute.clone()) }
  get createdAt() { return this.props.createdAt }
  set createdAt(value: Date) { this.props.createdAt = value }
  get updatedAt() { return this.props.updatedAt }
  set updatedAt(value: Date) { this.props.updatedAt = value }

  clone(): ProductAttributeSet {
    return new ProductAttributeSet({
      ...this.props,
      attributes: this.props.attributes.map((attribute) => attribute.clone()),
    })
  }
}
