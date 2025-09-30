export class CarrierResponseDto {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  contactEmail?: string;
  contactPhone?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  constructor(carrier: any) {
    this.id = carrier.id;
    this.name = carrier.name;
    this.description = carrier.description;
    this.isActive = carrier.isActive;
    this.contactEmail = carrier.contactEmail;
    this.contactPhone = carrier.contactPhone;
    this.metadata = carrier.metadata;
    this.createdAt = carrier.createdAt;
    this.updatedAt = carrier.updatedAt;
  }
}
