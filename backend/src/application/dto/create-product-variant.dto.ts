export class CreateProductVariantDto {
  productId!: number;
  sku!: string;
  name!: string;
  priceCents!: number;
  currency?: string;
  status?: string;
}
