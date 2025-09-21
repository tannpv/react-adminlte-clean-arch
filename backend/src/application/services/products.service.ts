import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Category } from "../../domain/entities/category.entity";
import {
  Product,
  ProductStatus,
  ProductType,
} from "../../domain/entities/product.entity";
import { ProductCreatedEvent } from "../../domain/events/product-created.event";
import { ProductRemovedEvent } from "../../domain/events/product-removed.event";
import { ProductUpdatedEvent } from "../../domain/events/product-updated.event";
import {
  CATEGORY_REPOSITORY,
  CategoryRepository,
} from "../../domain/repositories/category.repository";
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from "../../domain/repositories/product.repository";
import { DomainEventBus } from "../../shared/events/domain-event.bus";
import { validationException } from "../../shared/validation-error";
import { CreateProductDto } from "../dto/create-product.dto";
import { ProductResponseDto } from "../dto/product-response.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { toProductResponse } from "../mappers/product.mapper";

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: CategoryRepository,
    private readonly events: DomainEventBus
  ) {}

  async list(search?: string): Promise<ProductResponseDto[]> {
    const all = await this.products.findAll(search);
    return all.map((product) => toProductResponse(product));
  }

  async findById(id: number): Promise<ProductResponseDto> {
    const product = await this.products.findById(id);
    if (!product) throw new NotFoundException({ message: "Product not found" });
    return toProductResponse(product);
  }

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const sku = dto.sku.trim();
    const name = dto.name.trim();

    await this.ensureSkuUnique(sku);

    const priceCents = this.toPriceCents(dto.price);
    const status: ProductStatus = dto.status ?? "draft";
    const type: ProductType = dto.type ?? "simple";
    const now = new Date();
    const id = await this.products.nextId();

    const categories = await this.resolveCategories(dto.categories);

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
      type,
      createdAt: now,
      updatedAt: now,
    });

    const created = await this.products.create(product);
    this.events.publish(new ProductCreatedEvent(created));
    return toProductResponse(created);
  }

  async update(id: number, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.products.findById(id);
    if (!product) throw new NotFoundException({ message: "Product not found" });

    const sku = dto.sku?.trim() ?? product.sku;
    const name = dto.name?.trim() ?? product.name;

    if (sku !== product.sku) {
      await this.ensureSkuUnique(sku);
    }

    const priceCents =
      dto.price !== undefined
        ? this.toPriceCents(dto.price)
        : product.priceCents;
    const status: ProductStatus = dto.status ?? product.status;
    const type: ProductType = dto.type ?? product.type;
    const now = new Date();

    const categories =
      dto.categories !== undefined
        ? await this.resolveCategories(dto.categories)
        : product.categories;

    const updatedProduct = new Product({
      id: product.id,
      sku,
      name,
      description: dto.description ?? product.description,
      priceCents,
      currency: dto.currency?.trim().toUpperCase() ?? product.currency,
      status,
      metadata: dto.metadata ?? product.metadata,
      categories,
      type,
      createdAt: product.createdAt,
      updatedAt: now,
    });

    const updated = await this.products.update(updatedProduct);
    this.events.publish(new ProductUpdatedEvent(updated));
    return toProductResponse(updated);
  }

  async remove(id: number): Promise<ProductResponseDto> {
    const product = await this.products.findById(id);
    if (!product) throw new NotFoundException({ message: "Product not found" });

    const removed = await this.products.remove(id);
    if (!removed) throw new NotFoundException({ message: "Product not found" });

    this.events.publish(new ProductRemovedEvent(removed));
    return toProductResponse(removed);
  }

  private async ensureSkuUnique(sku: string): Promise<void> {
    const existing = await this.products.findBySku(sku);
    if (existing) {
      throw validationException({
        sku: {
          code: "SKU_EXISTS",
          message: "A product with this SKU already exists",
        },
      });
    }
  }

  private async resolveCategories(categoryIds?: number[]): Promise<Category[]> {
    if (!categoryIds || !categoryIds.length) return [];

    const categories = await Promise.all(
      categoryIds.map(async (id) => {
        const category = await this.categories.findById(id);
        if (!category) {
          throw validationException({
            categories: {
              code: "CATEGORY_NOT_FOUND",
              message: `Category with ID ${id} not found`,
            },
          });
        }
        return category;
      })
    );

    return categories;
  }

  private toPriceCents(price: number): number {
    return Math.round(price * 100);
  }
}
