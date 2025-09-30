export class ProductVariantResponseDto {
  id!: number;
  productId!: number;
  sku!: string;
  name!: string;
  priceCents!: number;
  currency!: string;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
