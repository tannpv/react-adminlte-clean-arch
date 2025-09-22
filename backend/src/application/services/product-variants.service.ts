import { Injectable, Inject } from '@nestjs/common';
import { ProductVariant } from '../../domain/entities/product-variant.entity';
import { ProductVariantRepository } from '../../domain/repositories/product-variant.repository';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto';

@Injectable()
export class ProductVariantsService {
  constructor(
    @Inject('ProductVariantRepository')
    private readonly productVariantRepository: ProductVariantRepository
  ) {}

  async create(createDto: CreateProductVariantDto): Promise<ProductVariant> {
    // Check if SKU already exists
    const existingVariant = await this.productVariantRepository.findBySku(createDto.sku);
    if (existingVariant) {
      throw new Error('Variant with this SKU already exists');
    }

    const productVariant = ProductVariant.create(
      createDto.productId,
      createDto.sku,
      createDto.name,
      createDto.priceCents,
      createDto.currency || 'USD',
      createDto.status || 'active'
    );

    return await this.productVariantRepository.save(productVariant);
  }

  async findAll(): Promise<ProductVariant[]> {
    // This would need to be implemented differently in a real scenario
    // For now, we'll return an empty array as we don't have a method to get all
    return [];
  }

  async findByProductId(productId: number): Promise<ProductVariant[]> {
    return await this.productVariantRepository.findByProductId(productId);
  }

  async findOne(id: number): Promise<ProductVariant | null> {
    return await this.productVariantRepository.findById(id);
  }

  async findBySku(sku: string): Promise<ProductVariant | null> {
    return await this.productVariantRepository.findBySku(sku);
  }

  async update(id: number, updateDto: UpdateProductVariantDto): Promise<ProductVariant> {
    const existing = await this.productVariantRepository.findById(id);
    if (!existing) {
      throw new Error('Product variant not found');
    }

    // Check if SKU is being changed and if it already exists
    if (updateDto.sku && updateDto.sku !== existing.sku) {
      const existingVariant = await this.productVariantRepository.findBySku(updateDto.sku);
      if (existingVariant) {
        throw new Error('Variant with this SKU already exists');
      }
    }

    const updated = existing.update(
      updateDto.sku,
      updateDto.name,
      updateDto.priceCents,
      updateDto.currency,
      updateDto.status
    );

    return await this.productVariantRepository.update(id, updated);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.productVariantRepository.findById(id);
    if (!existing) {
      throw new Error('Product variant not found');
    }

    await this.productVariantRepository.delete(id);
  }

  async removeByProductId(productId: number): Promise<void> {
    await this.productVariantRepository.deleteByProductId(productId);
  }
}
