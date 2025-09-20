import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  PRODUCT_ATTRIBUTE_REPOSITORY,
  ProductAttributeRepository,
} from '../../domain/repositories/product-attribute.repository'
import {
  ProductAttributeDefinition,
  ProductAttributeInputType,
  ProductAttributeTerm,
} from '../../domain/entities/product-attribute.entity'
import { CreateProductAttributeDto, CreateProductAttributeTermDto } from '../dto/create-product-attribute.dto'
import { UpdateProductAttributeDto, UpdateProductAttributeTermDto } from '../dto/update-product-attribute.dto'
import { ProductAttributeResponseDto, ProductAttributeTermResponseDto } from '../dto/product-attribute-response.dto'
import { validationException } from '../../shared/validation-error'

@Injectable()
export class ProductAttributesService {
  constructor(
    @Inject(PRODUCT_ATTRIBUTE_REPOSITORY) private readonly attributes: ProductAttributeRepository,
  ) {}

  async list(): Promise<ProductAttributeResponseDto[]> {
    const definitions = await this.attributes.findAll()
    return definitions.map((definition) => this.toResponse(definition))
  }

  async create(dto: CreateProductAttributeDto): Promise<ProductAttributeResponseDto> {
    await this.ensureSlugUnique(dto.slug)
    const now = new Date()
    const definition = new ProductAttributeDefinition({
      id: await this.attributes.nextAttributeId(),
      name: dto.name.trim(),
      slug: dto.slug.trim().toLowerCase(),
      description: dto.description ?? null,
      inputType: dto.inputType,
      terms: [],
      createdAt: now,
      updatedAt: now,
    })

    const created = await this.attributes.create(definition)

    if (Array.isArray(dto.terms) && dto.terms.length) {
      let order = 0
      for (const termDto of dto.terms) {
        await this.addTermInternal(created.id, termDto, order)
        order += 1
      }
    }

    const persisted = await this.attributes.findById(created.id)
    return persisted ? this.toResponse(persisted) : this.toResponse(created)
  }

  async update(id: number, dto: UpdateProductAttributeDto): Promise<ProductAttributeResponseDto> {
    const existing = await this.attributes.findById(id)
    if (!existing) throw new NotFoundException({ message: 'Attribute not found' })

    if (dto.slug && dto.slug.trim().toLowerCase() !== existing.slug) {
      await this.ensureSlugUnique(dto.slug.trim().toLowerCase(), id)
    }

    if (dto.name !== undefined) existing.name = dto.name.trim()
    if (dto.slug !== undefined) existing.slug = dto.slug.trim().toLowerCase()
    if (dto.description !== undefined) existing.description = dto.description ?? null
    if (dto.inputType !== undefined) existing.inputType = dto.inputType as ProductAttributeInputType
    existing.updatedAt = new Date()

    const updated = await this.attributes.update(existing)
    const persisted = await this.attributes.findById(updated.id)
    return persisted ? this.toResponse(persisted) : this.toResponse(updated)
  }

  async remove(id: number): Promise<ProductAttributeResponseDto> {
    const removed = await this.attributes.remove(id)
    if (!removed) throw new NotFoundException({ message: 'Attribute not found' })
    return this.toResponse(removed)
  }

  async addTerm(attributeId: number, dto: CreateProductAttributeTermDto): Promise<ProductAttributeResponseDto> {
    const attribute = await this.attributes.findById(attributeId)
    if (!attribute) throw new NotFoundException({ message: 'Attribute not found' })

    await this.addTermInternal(attributeId, dto, attribute.terms.length)
    const persisted = await this.attributes.findById(attributeId)
    return persisted ? this.toResponse(persisted) : this.toResponse(attribute)
  }

  async updateTerm(attributeId: number, termId: number, dto: UpdateProductAttributeTermDto): Promise<ProductAttributeResponseDto> {
    const attribute = await this.attributes.findById(attributeId)
    if (!attribute) throw new NotFoundException({ message: 'Attribute not found' })
    const term = attribute.terms.find((t) => t.id === termId)
    if (!term) throw new NotFoundException({ message: 'Attribute term not found' })

    if (dto.name !== undefined) term.name = dto.name.trim()
    if (dto.slug !== undefined) term.slug = dto.slug.trim().toLowerCase()
    if (dto.metadata !== undefined) term.metadata = dto.metadata ?? null
    if (dto.sortOrder !== undefined) term.order = dto.sortOrder
    term.updatedAt = new Date()

    await this.attributes.updateTerm(attributeId, term)
    const persisted = await this.attributes.findById(attributeId)
    return persisted ? this.toResponse(persisted) : this.toResponse(attribute)
  }

  async removeTerm(attributeId: number, termId: number): Promise<ProductAttributeResponseDto> {
    const attribute = await this.attributes.findById(attributeId)
    if (!attribute) throw new NotFoundException({ message: 'Attribute not found' })
    await this.attributes.removeTerm(attributeId, termId)
    const persisted = await this.attributes.findById(attributeId)
    return persisted ? this.toResponse(persisted) : this.toResponse(attribute)
  }

  private async ensureSlugUnique(slug: string, ignoreId?: number): Promise<void> {
    const existing = await this.attributes.findBySlug(slug)
    if (existing && existing.id !== ignoreId) {
      throw validationException({ slug: { code: 'SLUG_EXISTS', message: 'Attribute slug already exists' } })
    }
  }

  private async addTermInternal(attributeId: number, dto: CreateProductAttributeTermDto, order: number): Promise<void> {
    const now = new Date()
    const term = new ProductAttributeTerm({
      id: await this.attributes.nextTermId(attributeId),
      attributeId,
      name: dto.name.trim(),
      slug: dto.slug.trim().toLowerCase(),
      order,
      metadata: dto.metadata ?? null,
      createdAt: now,
      updatedAt: now,
    })
    await this.attributes.addTerm(attributeId, term)
  }

  private toResponse(definition: ProductAttributeDefinition): ProductAttributeResponseDto {
    return {
      id: definition.id,
      name: definition.name,
      slug: definition.slug,
      description: definition.description ?? null,
      inputType: definition.inputType,
      terms: definition.terms.map((term) => this.toTermResponse(term)),
      createdAt: definition.createdAt.toISOString(),
      updatedAt: definition.updatedAt.toISOString(),
    }
  }

  private toTermResponse(term: ProductAttributeTerm): ProductAttributeTermResponseDto {
    return {
      id: term.id,
      name: term.name,
      slug: term.slug,
      order: term.order,
      metadata: term.metadata ? { ...term.metadata } : null,
      createdAt: term.createdAt.toISOString(),
      updatedAt: term.updatedAt.toISOString(),
    }
  }
}
