export type CommissionStatus = "pending" | "paid" | "cancelled";

export interface CommissionProps {
  id: number;
  orderItemId: number;
  storeId: number;
  commissionRate: number;
  commissionAmount: number;
  status: CommissionStatus;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicCommission {
  id: number;
  orderItemId: number;
  storeId: number;
  commissionRate: number;
  commissionAmount: number;
  status: CommissionStatus;
  paidAt?: string | null;
  createdAt: string;
}

export class Commission {
  constructor(private props: CommissionProps) {}

  get id() {
    return this.props.id;
  }

  get orderItemId() {
    return this.props.orderItemId;
  }

  get storeId() {
    return this.props.storeId;
  }

  get commissionRate() {
    return this.props.commissionRate;
  }

  set commissionRate(value: number) {
    this.props.commissionRate = value;
  }

  get commissionAmount() {
    return this.props.commissionAmount;
  }

  set commissionAmount(value: number) {
    this.props.commissionAmount = value;
  }

  get status() {
    return this.props.status;
  }

  set status(value: CommissionStatus) {
    this.props.status = value;
  }

  get paidAt() {
    return this.props.paidAt ?? null;
  }

  set paidAt(value: Date | null | undefined) {
    this.props.paidAt = value ?? null;
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

  toPublic(): PublicCommission {
    return {
      id: this.props.id,
      orderItemId: this.props.orderItemId,
      storeId: this.props.storeId,
      commissionRate: this.props.commissionRate,
      commissionAmount: this.props.commissionAmount,
      status: this.props.status,
      paidAt: this.props.paidAt?.toISOString() ?? null,
      createdAt: this.props.createdAt.toISOString(),
    };
  }

  clone(): Commission {
    return new Commission({
      ...this.props,
    });
  }

  isPending(): boolean {
    return this.props.status === "pending";
  }

  isPaid(): boolean {
    return this.props.status === "paid";
  }

  isCancelled(): boolean {
    return this.props.status === "cancelled";
  }

  canBePaid(): boolean {
    return this.props.status === "pending";
  }

  canBeCancelled(): boolean {
    return this.props.status === "pending";
  }

  markAsPaid(): void {
    this.props.status = "paid";
    this.props.paidAt = new Date();
  }

  markAsCancelled(): void {
    this.props.status = "cancelled";
  }

  calculateCommissionAmount(orderItemTotal: number): number {
    return (orderItemTotal * this.props.commissionRate) / 100;
  }
}
