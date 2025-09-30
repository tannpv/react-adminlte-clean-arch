import { Injectable, Inject } from '@nestjs/common';
import { ProductVariant } from '../../domain/entities/product-variant.entity';
import { ProductVariantRepository } from '../../domain/repositories/product-variant.repository';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto';
import { ProductAttributeValuesService } from './product-attribute-values.service';
import { AttributeValuesService } from './attribute-values.service';

@Injectable()
export class ProductVariantsService {
  constructor(
    @Inject('ProductVariantRepository')
    private readonly productVariantRepository: ProductVariantRepository,
    private readonly productAttributeValuesService: ProductAttributeValuesService,
    private readonly attributeValuesService: AttributeValuesService
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
    return await this.productVariantRepository.findAll();
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

  async getVariantAttributeValues(variantId: number): Promise<any[]> {
    // This would need to be implemented with a proper variant attribute values service
    // For now, return empty array
    return [];
  }

  async setVariantAttributeValues(variantId: number, attributeValues: Record<string, any>): Promise<void> {
    // This would need to be implemented with a proper variant attribute values service
    // For now, just log the values
    console.log('Setting variant attribute values:', { variantId, attributeValues });
  }

  async generateVariantsFromAttributes(productId: number): Promise<ProductVariant[]> {
    try {
      // Get product attribute values to understand the combinations
      const productAttributeValues = await this.productAttributeValuesService.findByProductId(productId);
      
      if (!productAttributeValues || productAttributeValues.length === 0) {
        throw new Error('No attribute values found for this product');
      }

      // Group attribute values by attribute
      const attributeGroups = new Map<number, any[]>();
      productAttributeValues.forEach(pav => {
        if (!attributeGroups.has(pav.attributeId)) {
          attributeGroups.set(pav.attributeId, []);
        }
        attributeGroups.get(pav.attributeId)!.push(pav);
      });

      // Generate all possible combinations
      const combinations = this.generateCombinations(Array.from(attributeGroups.values()));
      
      const variants: ProductVariant[] = [];
      
      for (let i = 0; i < combinations.length; i++) {
        const combination = combinations[i];
        const sku = `VAR-${productId}-${i + 1}`;
        const name = `Variant ${i + 1}`;
        
        // Create variant
        const variant = ProductVariant.create(
          productId,
          sku,
          name,
          0, // Default price
          'USD',
          'active'
        );
        
        const savedVariant = await this.productVariantRepository.save(variant);
        variants.push(savedVariant);
        
        // TODO: Set variant attribute values for this combination
        console.log('Generated variant:', { variant: savedVariant, combination });
      }
      
      return variants;
    } catch (error) {
      console.error('Error generating variants:', error);
      throw error;
    }
  }

  private generateCombinations(attributeGroups: any[][]): any[][] {
    if (attributeGroups.length === 0) return [[]];
    if (attributeGroups.length === 1) return attributeGroups[0].map(item => [item]);
    
    const result: any[][] = [];
    const firstGroup = attributeGroups[0];
    const restCombinations = this.generateCombinations(attributeGroups.slice(1));
    
    for (const item of firstGroup) {
      for (const combination of restCombinations) {
        result.push([item, ...combination]);
      }
    }
    
    return result;
  }
}
