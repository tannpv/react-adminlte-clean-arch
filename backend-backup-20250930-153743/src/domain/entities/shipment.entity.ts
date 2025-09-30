export type ShipmentStatus =
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface ShipmentProps {
  id: number;
  storeOrderId: number;
  trackingNumber?: string | null;
  carrier?: string | null;
  status: ShipmentStatus;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicShipment {
  id: number;
  storeOrderId: number;
  trackingNumber?: string | null;
  carrier?: string | null;
  status: ShipmentStatus;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
}

export class Shipment {
  constructor(private props: ShipmentProps) {}

  get id() {
    return this.props.id;
  }

  get storeOrderId() {
    return this.props.storeOrderId;
  }

  get trackingNumber() {
    return this.props.trackingNumber ?? null;
  }

  set trackingNumber(value: string | null | undefined) {
    this.props.trackingNumber = value ?? null;
  }

  get carrier() {
    return this.props.carrier ?? null;
  }

  set carrier(value: string | null | undefined) {
    this.props.carrier = value ?? null;
  }

  get status() {
    return this.props.status;
  }

  set status(value: ShipmentStatus) {
    this.props.status = value;
  }

  get shippedAt() {
    return this.props.shippedAt ?? null;
  }

  set shippedAt(value: Date | null | undefined) {
    this.props.shippedAt = value ?? null;
  }

  get deliveredAt() {
    return this.props.deliveredAt ?? null;
  }

  set deliveredAt(value: Date | null | undefined) {
    this.props.deliveredAt = value ?? null;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  set createdAt(value: Date) {
    this.props.createdAt = value;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  set updatedAt(value: Date) {
    this.props.updatedAt = value;
  }

  toPublic(): PublicShipment {
    return {
      id: this.props.id,
      storeOrderId: this.props.storeOrderId,
      trackingNumber: this.props.trackingNumber ?? null,
      carrier: this.props.carrier ?? null,
      status: this.props.status,
      shippedAt: this.props.shippedAt?.toISOString() ?? null,
      deliveredAt: this.props.deliveredAt?.toISOString() ?? null,
      createdAt: this.props.createdAt.toISOString(),
    };
  }

  clone(): Shipment {
    return new Shipment({
      ...this.props,
    });
  }

  isPreparing(): boolean {
    return this.props.status === "preparing";
  }

  isShipped(): boolean {
    return this.props.status === "shipped";
  }

  isDelivered(): boolean {
    return this.props.status === "delivered";
  }

  isCancelled(): boolean {
    return this.props.status === "cancelled";
  }

  canBeShipped(): boolean {
    return this.props.status === "preparing";
  }

  canBeDelivered(): boolean {
    return this.props.status === "shipped";
  }

  canBeCancelled(): boolean {
    return this.props.status === "preparing" || this.props.status === "shipped";
  }

  markAsShipped(trackingNumber?: string, carrier?: string): void {
    this.props.status = "shipped";
    this.props.shippedAt = new Date();
    if (trackingNumber) {
      this.props.trackingNumber = trackingNumber;
    }
    if (carrier) {
      this.props.carrier = carrier;
    }
  }

  markAsDelivered(): void {
    this.props.status = "delivered";
    this.props.deliveredAt = new Date();
  }

  markAsCancelled(): void {
    this.props.status = "cancelled";
  }
}
