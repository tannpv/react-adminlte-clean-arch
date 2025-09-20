import { Category } from './category.entity'

export type ProductStatus = 'draft' | 'published' | 'archived'
export type ProductType = 'simple' | 'variable'

export interface ProductAttributeTermSelection {
  termId: number
  termName: string
  termSlug: string
}

export interface ProductAttributeSelection {
  attributeId: number
  attributeName: string
  attributeSlug: string
  terms: ProductAttributeTermSelection[]
  visible: boolean
  variation: boolean
}

export interface ProductVariantAttributeValue {
  attributeId: number
  attributeName: string
  attributeSlug: string
  termId: number
  termName: string
  termSlug: string
}

export interface ProductVariantProps {
  id: number
  sku: string
  priceCents: number
  salePriceCents?: number | null
  currency: string
  status: ProductStatus
  stockQuantity?: number | null
  metadata?: Record<string, unknown> | null
  attributes: ProductVariantAttributeValue[]
  createdAt: Date
  updatedAt: Date
}

export class ProductVariant {
  constructor(private props: ProductVariantProps) {}

  get id() { return this.props.id }
  get sku() { return this.props.sku }
  set sku(value: string) { this.props.sku = value }
  get priceCents() { return this.props.priceCents }
  set priceCents(value: number) { this.props.priceCents = value }
  get salePriceCents() { return this.props.salePriceCents ?? null }
  set salePriceCents(value: number | null | undefined) { this.props.salePriceCents = value ?? null }
  get currency() { return this.props.currency }
  set currency(value: string) { this.props.currency = value }
  get status() { return this.props.status }
  set status(value: ProductStatus) { this.props.status = value }
  get stockQuantity() { return this.props.stockQuantity ?? null }
  set stockQuantity(value: number | null | undefined) { this.props.stockQuantity = value ?? null }
  get metadata() { return this.props.metadata ?? null }
  set metadata(value: Record<string, unknown> | null | undefined) { this.props.metadata = value ?? null }
  get attributes() { return this.props.attributes.map(cloneVariantAttributeValue) }
  set attributes(values: ProductVariantAttributeValue[]) { this.props.attributes = values.map(cloneVariantAttributeValue) }
  get createdAt() { return this.props.createdAt }
  set createdAt(value: Date) { this.props.createdAt = value }
  get updatedAt() { return this.props.updatedAt }
  set updatedAt(value: Date) { this.props.updatedAt = value }

  clone(): ProductVariant {
    return new ProductVariant({
      ...this.props,
      metadata: this.props.metadata ? { ...this.props.metadata } : null,
      attributes: this.props.attributes.map(cloneVariantAttributeValue),
    })
  }
}

export interface ProductProps {
  id: number
  sku: string
  name: string
  description?: string | null
  priceCents: number
  currency: string
  status: ProductStatus
  metadata?: Record<string, unknown> | null
  categories: Category[]
  type: ProductType
  attributes: ProductAttributeSelection[]
  variants: ProductVariant[]
  createdAt: Date
  updatedAt: Date
}

export class Product {
  constructor(private props: ProductProps) {}

  get id() { return this.props.id }
  get sku() { return this.props.sku }
  set sku(value: string) { this.props.sku = value }
  get name() { return this.props.name }
  set name(value: string) { this.props.name = value }
  get description() { return this.props.description ?? null }
  set description(value: string | null | undefined) { this.props.description = value ?? null }
  get priceCents() { return this.props.priceCents }
  set priceCents(value: number) { this.props.priceCents = value }
  get currency() { return this.props.currency }
  set currency(value: string) { this.props.currency = value }
  get status() { return this.props.status }
  set status(value: ProductStatus) { this.props.status = value }
  get metadata() { return this.props.metadata ?? null }
  set metadata(value: Record<string, unknown> | null | undefined) { this.props.metadata = value ?? null }
  get categories() { return this.props.categories.map((category) => category.clone()) }
  set categories(categories: Category[]) { this.props.categories = categories.map((category) => category.clone()) }
  get categoryIds() { return this.props.categories.map((category) => category.id) }
  get type() { return this.props.type }
  set type(value: ProductType) { this.props.type = value }
  get attributes() { return this.props.attributes.map(cloneAttributeSelection) }
  set attributes(value: ProductAttributeSelection[]) { this.props.attributes = value.map(cloneAttributeSelection) }
  get variants() { return this.props.variants.map((variant) => variant.clone()) }
  set variants(value: ProductVariant[]) { this.props.variants = value.map((variant) => variant.clone()) }
  get createdAt() { return this.props.createdAt }
  set createdAt(value: Date) { this.props.createdAt = value }
  get updatedAt() { return this.props.updatedAt }
  set updatedAt(value: Date) { this.props.updatedAt = value }

  clone(): Product {
    return new Product({
      ...this.props,
      metadata: this.props.metadata ? { ...this.props.metadata } : null,
      categories: this.props.categories.map((category) => category.clone()),
      attributes: this.props.attributes.map(cloneAttributeSelection),
      variants: this.props.variants.map((variant) => variant.clone()),
    })
  }
}

function cloneAttributeSelection(selection: ProductAttributeSelection): ProductAttributeSelection {
  return {
    attributeId: selection.attributeId,
    attributeName: selection.attributeName,
    attributeSlug: selection.attributeSlug,
    visible: selection.visible,
    variation: selection.variation,
    terms: selection.terms.map((term) => ({ ...term })),
  }
}

function cloneVariantAttributeValue(value: ProductVariantAttributeValue): ProductVariantAttributeValue {
  return {
    attributeId: value.attributeId,
    attributeName: value.attributeName,
    attributeSlug: value.attributeSlug,
    termId: value.termId,
    termName: value.termName,
    termSlug: value.termSlug,
  }
}
