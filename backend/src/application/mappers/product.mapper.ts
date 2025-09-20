import { Product } from '../../domain/entities/product.entity'
import { ProductResponseDto } from '../dto/product-response.dto'

export function toProductResponse(product: Product): ProductResponseDto {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description ?? null,
    priceCents: product.priceCents,
    currency: product.currency,
    status: product.status,
    metadata: product.metadata ? { ...product.metadata } : null,
    categories: product.categories.map((category) => ({ id: category.id, name: category.name })),
    attributeSetId: product.attributeSetId,
    type: product.type,
    attributes: product.attributes.map((attribute) => ({
      attributeId: attribute.attributeId,
      attributeName: attribute.attributeName,
      attributeSlug: attribute.attributeSlug,
      visible: attribute.visible,
      variation: attribute.variation,
      terms: attribute.terms.map((term) => ({
        termId: term.termId,
        termName: term.termName,
        termSlug: term.termSlug,
      })),
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      priceCents: variant.priceCents,
      salePriceCents: variant.salePriceCents ?? null,
      currency: variant.currency,
      status: variant.status,
      stockQuantity: variant.stockQuantity ?? null,
      metadata: variant.metadata ? { ...variant.metadata } : null,
      attributes: variant.attributes.map((value) => ({
        attributeId: value.attributeId,
        attributeName: value.attributeName,
        attributeSlug: value.attributeSlug,
        termId: value.termId,
        termName: value.termName,
        termSlug: value.termSlug,
      })),
      createdAt: variant.createdAt.toISOString(),
      updatedAt: variant.updatedAt.toISOString(),
    })),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}
