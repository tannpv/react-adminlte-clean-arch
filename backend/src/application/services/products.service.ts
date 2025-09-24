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
import {
  ProductSearchDto,
  ProductSearchResponseDto,
} from "../dto/product-search.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { toProductResponse } from "../mappers/product.mapper";
import { ProductAttributeValuesService } from "./product-attribute-values.service";
import { ProductVariantsService } from "./product-variants.service";

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly products: ProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categories: CategoryRepository,
    private readonly events: DomainEventBus,
    private readonly productAttributeValuesService: ProductAttributeValuesService,
    private readonly productVariantsService: ProductVariantsService
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

  async getProductAttributeValues(productId: number) {
    return await this.productAttributeValuesService.findByProductId(productId);
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

    // Save product attribute values if provided
    if (dto.attributeValues) {
      console.log("Saving product attribute values:", dto.attributeValues);
      await this.saveProductAttributeValues(created.id, dto.attributeValues);
    }

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

    // Update product attribute values if provided
    if (dto.attributeValues !== undefined) {
      // Remove existing attribute values
      await this.productAttributeValuesService.removeByProductId(id);
      // Save new attribute values
      if (dto.attributeValues && Object.keys(dto.attributeValues).length > 0) {
        await this.saveProductAttributeValues(id, dto.attributeValues);
      }
    }

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

  private async saveProductAttributeValues(
    productId: number,
    attributeValues: Record<string, any>
  ): Promise<void> {
    console.log("saveProductAttributeValues called with:", {
      productId,
      attributeValues,
    });
    try {
      // First, delete all existing attribute values for this product
      console.log(
        "Deleting all existing attribute values for product:",
        productId
      );
      await this.productAttributeValuesService.removeByProductId(productId);

      // Then, create new attribute values based on current selection
      for (const [attributeId, valueData] of Object.entries(attributeValues)) {
        console.log("Processing attribute:", { attributeId, valueData });
        if (valueData && Object.keys(valueData).length > 0) {
          // Handle normalized structure with attributeValueIds (new approach)
          if (
            valueData.attributeValueIds &&
            Array.isArray(valueData.attributeValueIds) &&
            valueData.attributeValueIds.length > 0
          ) {
            // Create one record per attribute value ID
            for (const attributeValueId of valueData.attributeValueIds) {
              const createData = {
                productId,
                attributeId: parseInt(attributeId),
                attributeValueId: attributeValueId,
                valueText: undefined,
                valueNumber: undefined,
                valueBoolean: undefined,
              };
              console.log(
                "Creating normalized product attribute value:",
                createData
              );
              try {
                const result = await this.productAttributeValuesService.create(
                  createData
                );
                console.log(
                  "Successfully created normalized product attribute value:",
                  result
                );
              } catch (error) {
                console.error(
                  "Error creating normalized product attribute value:",
                  error
                );
                throw error;
              }
            }
          } else if (
            valueData.valueText ||
            valueData.valueNumber !== null ||
            valueData.valueBoolean !== null
          ) {
            // Handle legacy structure (old approach for backward compatibility)
            const createData = {
              productId,
              attributeId: parseInt(attributeId),
              attributeValueId: valueData.attributeValueId || undefined,
              valueText: valueData.valueText || undefined,
              valueNumber: valueData.valueNumber || undefined,
              valueBoolean: valueData.valueBoolean || undefined,
            };
            console.log("Creating product attribute value:", createData);
            try {
              const result = await this.productAttributeValuesService.create(
                createData
              );
              console.log(
                "Successfully created product attribute value:",
                result
              );
            } catch (error) {
              console.error("Error creating product attribute value:", error);
              throw error;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in saveProductAttributeValues:", error);
      throw error;
    }
  }

  async getProductVariants(productId: number): Promise<any[]> {
    try {
      return await this.productVariantsService.findByProductId(productId);
    } catch (error) {
      console.error("Error getting product variants:", error);
      throw error;
    }
  }

  async advancedSearch(
    searchDto: ProductSearchDto
  ): Promise<ProductSearchResponseDto> {
    try {
      // Use the repository's advanced search method
      const result = await this.products.advancedSearch(searchDto);

      return {
        products: result.products.map((product) => toProductResponse(product)),
        total: result.total,
        page: searchDto.page || 1,
        limit: searchDto.limit || 20,
        totalPages: Math.ceil(result.total / (searchDto.limit || 20)),
        facets: result.facets,
      };
    } catch (error) {
      console.error("Error in advanced search:", error);
      throw error;
    }
  }
}
