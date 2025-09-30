export type StoreOrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface StoreOrderProps {
  id: number;
  parentOrderId: number;
  customerId: number;
  storeId: number;
  orderNumber: string;
  status: StoreOrderStatus;
  totalAmount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicStoreOrder {
  id: number;
  parentOrderId: number;
  customerId: number;
  storeId: number;
  orderNumber: string;
  status: StoreOrderStatus;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

export class StoreOrder {
  constructor(private props: StoreOrderProps) {}

  get id() {
    return this.props.id;
  }

  get parentOrderId() {
    return this.props.parentOrderId;
  }

  get customerId() {
    return this.props.customerId;
  }

  get storeId() {
    return this.props.storeId;
  }

  get orderNumber() {
    return this.props.orderNumber;
  }

  set orderNumber(value: string) {
    this.props.orderNumber = value;
  }

  get status() {
    return this.props.status;
  }

  set status(value: StoreOrderStatus) {
    this.props.status = value;
  }

  get totalAmount() {
    return this.props.totalAmount;
  }

  set totalAmount(value: number) {
    this.props.totalAmount = value;
  }

  get currency() {
    return this.props.currency;
  }

  set currency(value: string) {
    this.props.currency = value;
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

  toPublic(): PublicStoreOrder {
    return {
      id: this.props.id,
      parentOrderId: this.props.parentOrderId,
      customerId: this.props.customerId,
      storeId: this.props.storeId,
      orderNumber: this.props.orderNumber,
      status: this.props.status,
      totalAmount: this.props.totalAmount,
      currency: this.props.currency,
      createdAt: this.props.createdAt.toISOString(),
    };
  }

  clone(): StoreOrder {
    return new StoreOrder({
      ...this.props,
    });
  }

  isPending(): boolean {
    return this.props.status === "pending";
  }

  isProcessing(): boolean {
    return this.props.status === "processing";
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

  canBeCancelled(): boolean {
    return (
      this.props.status === "pending" || this.props.status === "processing"
    );
  }

  canBeShipped(): boolean {
    return this.props.status === "processing";
  }

  canBeDelivered(): boolean {
    return this.props.status === "shipped";
  }
}
