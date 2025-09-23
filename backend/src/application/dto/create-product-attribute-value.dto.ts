export class CreateProductAttributeValueDto {
  productId!: number;
  attributeId!: number;
  attributeValueId?: number;
  valueText?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
}
