export type ParentOrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "cancelled";

export interface ParentOrderProps {
  id: number;
  customerId: number;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: ParentOrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicParentOrder {
  id: number;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: ParentOrderStatus;
  createdAt: string;
}

export class ParentOrder {
  constructor(private props: ParentOrderProps) {}

  get id() {
    return this.props.id;
  }

  get customerId() {
    return this.props.customerId;
  }

  get orderNumber() {
    return this.props.orderNumber;
  }

  set orderNumber(value: string) {
    this.props.orderNumber = value;
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

  get status() {
    return this.props.status;
  }

  set status(value: ParentOrderStatus) {
    this.props.status = value;
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

  toPublic(): PublicParentOrder {
    return {
      id: this.props.id,
      orderNumber: this.props.orderNumber,
      totalAmount: this.props.totalAmount,
      currency: this.props.currency,
      status: this.props.status,
      createdAt: this.props.createdAt.toISOString(),
    };
  }

  clone(): ParentOrder {
    return new ParentOrder({
      ...this.props,
    });
  }

  isPending(): boolean {
    return this.props.status === "pending";
  }

  isProcessing(): boolean {
    return this.props.status === "processing";
  }

  isCompleted(): boolean {
    return this.props.status === "completed";
  }

  isCancelled(): boolean {
    return this.props.status === "cancelled";
  }

  canBeCancelled(): boolean {
    return (
      this.props.status === "pending" || this.props.status === "processing"
    );
  }
}
