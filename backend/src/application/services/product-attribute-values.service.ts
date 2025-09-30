import { Inject, Injectable } from "@nestjs/common";
import { ProductAttributeValue } from "../../domain/entities/product-attribute-value.entity";
import { ProductAttributeValueRepository } from "../../domain/repositories/product-attribute-value.repository";
import { CreateProductAttributeValueDto } from "../dto/create-product-attribute-value.dto";
import { UpdateProductAttributeValueDto } from "../dto/update-product-attribute-value.dto";

@Injectable()
export class ProductAttributeValuesService {
  constructor(
    @Inject("ProductAttributeValueRepository")
    private readonly productAttributeValueRepository: ProductAttributeValueRepository
  ) {}

  async create(
    createDto: CreateProductAttributeValueDto
  ): Promise<ProductAttributeValue> {
    const productAttributeValue = ProductAttributeValue.create(
      createDto.productId,
      createDto.attributeId,
      createDto.attributeValueId,
      createDto.valueText,
      createDto.valueNumber,
      createDto.valueBoolean
    );

    return await this.productAttributeValueRepository.save(
      productAttributeValue
    );
  }

  async findAll(): Promise<ProductAttributeValue[]> {
    // This would need to be implemented differently in a real scenario
    // For now, we'll return an empty array as we don't have a method to get all
    return [];
  }

  async findByProductId(productId: number): Promise<ProductAttributeValue[]> {
    return await this.productAttributeValueRepository.findByProductId(
      productId
    );
  }

  async findByAttributeId(
    attributeId: number
  ): Promise<ProductAttributeValue[]> {
    return await this.productAttributeValueRepository.findByAttributeId(
      attributeId
    );
  }

  async findOne(id: number): Promise<ProductAttributeValue | null> {
    return await this.productAttributeValueRepository.findById(id);
  }

  async findByProductAndAttribute(
    productId: number,
    attributeId: number
  ): Promise<ProductAttributeValue | null> {
    return await this.productAttributeValueRepository.findByProductAndAttribute(
      productId,
      attributeId
    );
  }

  async update(
    id: number,
    updateDto: UpdateProductAttributeValueDto
  ): Promise<ProductAttributeValue> {
    const existing = await this.productAttributeValueRepository.findById(id);
    if (!existing) {
      throw new Error("Product attribute value not found");
    }

    const updated = existing.update(
      updateDto.attributeValueId,
      updateDto.valueText,
      updateDto.valueNumber,
      updateDto.valueBoolean
    );

    return await this.productAttributeValueRepository.update(id, updated);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.productAttributeValueRepository.findById(id);
    if (!existing) {
      throw new Error("Product attribute value not found");
    }

    await this.productAttributeValueRepository.delete(id);
  }

  async removeByProductId(productId: number): Promise<void> {
    await this.productAttributeValueRepository.deleteByProductId(productId);
  }

  async removeByProductAndAttribute(
    productId: number,
    attributeId: number
  ): Promise<void> {
    await this.productAttributeValueRepository.deleteByProductAndAttribute(
      productId,
      attributeId
    );
  }

  // Advanced filtering methods for normalized schema

  /**
   * Find products by attribute values (for advanced filtering)
   */
  async findProductsByAttributeValues(
    attributeValueIds: number[]
  ): Promise<number[]> {
    return await this.productAttributeValueRepository.findProductsByAttributeValues(
      attributeValueIds
    );
  }

  /**
   * Get faceted search data for an attribute
   */
  async getFacetedSearchData(attributeId: number): Promise<
    Array<{
      attributeValueId: number;
      label: string;
      productCount: number;
    }>
  > {
    return await this.productAttributeValueRepository.getFacetedSearchData(
      attributeId
    );
  }

  /**
   * Get multiple attribute faceted search data
   */
  async getMultiAttributeFacetedSearchData(attributeIds: number[]): Promise<
    Record<
      number,
      Array<{
        attributeValueId: number;
        label: string;
        productCount: number;
      }>
    >
  > {
    return await this.productAttributeValueRepository.getMultiAttributeFacetedSearchData(
      attributeIds
    );
  }

  /**
   * Advanced product filtering with multiple attribute values
   */
  async filterProductsByAttributes(
    attributeFilters: Array<{
      attributeId: number;
      attributeValueIds: number[];
    }>
  ): Promise<number[]> {
    return await this.productAttributeValueRepository.filterProductsByAttributes(
      attributeFilters
    );
  }
}
