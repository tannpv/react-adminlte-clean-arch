import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { PRODUCT_REPOSITORY, ProductRepository } from '../../domain/repositories/product.repository'
import { CreateProductDto } from '../dto/create-product.dto'
import { UpdateProductDto } from '../dto/update-product.dto'
import { Product, ProductStatus } from '../../domain/entities/product.entity'
import { validationException } from '../../shared/validation-error'
import { DomainEventBus } from '../../shared/events/domain-event.bus'
import { ProductCreatedEvent } from '../../domain/events/product-created.event'
import { ProductUpdatedEvent } from '../../domain/events/product-updated.event'
import { ProductRemovedEvent } from '../../domain/events/product-removed.event'
import { toProductResponse } from '../mappers/product.mapper'
import { ProductResponseDto } from '../dto/product-response.dto'
import { CATEGORY_REPOSITORY, CategoryRepository } from '../../domain/repositories/category.repository'
import { Category } from '../../domain/entities/category.entity'

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository,
    private readonly events: DomainEventBus,
  ) {}

  async list(): Promise<ProductResponseDto[]> {
    const all = await this.products.findAll()
    return all.map((product) => toProductResponse(product))
  }

  async findById(id: number): Promise<ProductResponseDto> {
    const product = await this.products.findById(id)
    if (!product) throw new NotFoundException({ message: 'Product not found' })
    return toProductResponse(product)
  }

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const sku = dto.sku.trim()
    const name = dto.name.trim()

    await this.ensureSkuUnique(sku)

    const priceCents = this.toPriceCents(dto.price)
    const status: ProductStatus = dto.status ?? 'draft'
    const now = new Date()
    const id = await this.products.nextId()

    const categories = await this.resolveCategories(dto.categories)

    const product = new Product({
      id,
      sku,
      name,
      description: dto.description ?? null,
      priceCents,
      currency: dto.currency.trim().toUpperCase(),
      status,
      metadata: dto.metadata ?? null,
      categories,
      createdAt: now,
      updatedAt: now,
    })

    const created = await this.products.create(product)
    this.events.publish(new ProductCreatedEvent(created))
    return toProductResponse(created)
  }

  async update(id: number, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.products.findById(id)
    if (!product) throw new NotFoundException({ message: 'Product not found' })

    if (dto.sku !== undefined) {
      const newSku = dto.sku.trim()
      if (!newSku) {
        throw validationException({ sku: { code: 'SKU_REQUIRED', message: 'SKU is required' } })
      }
      if (newSku !== product.sku) {
        await this.ensureSkuUnique(newSku)
      }
      product.sku = newSku
    }

    if (dto.name !== undefined) {
      const newName = dto.name.trim()
      if (!newName) {
        throw validationException({ name: { code: 'NAME_REQUIRED', message: 'Name is required' } })
      }
      product.name = newName
    }

    if (dto.description !== undefined) {
      product.description = dto.description ?? null
    }

    if (dto.price !== undefined) {
      product.priceCents = this.toPriceCents(dto.price)
    }

    if (dto.currency !== undefined) {
      const currency = dto.currency.trim().toUpperCase()
      if (!currency) {
        throw validationException({ currency: { code: 'CURRENCY_REQUIRED', message: 'Currency is required' } })
      }
      product.currency = currency
    }

    if (dto.status !== undefined) {
      product.status = dto.status
    }

    if (dto.metadata !== undefined) {
      product.metadata = dto.metadata ?? null
    }

    if (dto.categories !== undefined) {
      const categories = await this.resolveCategories(dto.categories)
      product.categories = categories
    }

    product.updatedAt = new Date()

    const updated = await this.products.update(product)
    this.events.publish(new ProductUpdatedEvent(updated))
    return toProductResponse(updated)
  }

  async remove(id: number): Promise<ProductResponseDto> {
    const removed = await this.products.remove(id)
    if (!removed) throw new NotFoundException({ message: 'Product not found' })
    this.events.publish(new ProductRemovedEvent(removed))
    return toProductResponse(removed)
  }

  private async ensureSkuUnique(sku: string): Promise<void> {
    const existing = await this.products.findBySku(sku)
    if (existing) {
      throw validationException({ sku: { code: 'SKU_EXISTS', message: 'SKU already exists' } })
    }
  }

  private toPriceCents(price: number): number {
    if (Number.isNaN(price) || !Number.isFinite(price)) {
      throw validationException({ price: { code: 'PRICE_INVALID', message: 'Price is invalid' } })
    }
    const cents = Math.round(price * 100)
    if (cents <= 0) {
      throw validationException({ price: { code: 'PRICE_INVALID', message: 'Price must be greater than zero' } })
    }
    return cents
  }

  private async resolveCategories(categoryIds?: number[]): Promise<Category[]> {
    if (!categoryIds || !categoryIds.length) return []

    const uniqueIds = Array.from(new Set(categoryIds.filter((id) => Number.isInteger(id))))
    if (!uniqueIds.length) return []

    const categories = await this.categories.findByIds(uniqueIds)
    const foundIds = new Set(categories.map((category) => category.id))
    const missing = uniqueIds.filter((id) => !foundIds.has(id))
    if (missing.length) {
      throw validationException({
        categories: {
          code: 'CATEGORIES_INVALID',
          message: 'One or more categories are invalid',
        },
      })
    }
    return categories
  }
}
