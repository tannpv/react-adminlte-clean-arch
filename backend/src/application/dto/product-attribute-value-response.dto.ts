export class ProductAttributeValueResponseDto {
  id!: number;
  productId!: number;
  attributeId!: number;
  attributeValueId!: number | null;
  valueText!: string | null;
  valueNumber!: number | null;
  valueBoolean!: boolean | null;
  createdAt!: Date;
  updatedAt!: Date;
}
