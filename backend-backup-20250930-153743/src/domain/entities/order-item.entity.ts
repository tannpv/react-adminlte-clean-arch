export interface OrderItemProps {
  id: number;
  storeOrderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

export interface PublicOrderItem {
  id: number;
  storeOrderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

export class OrderItem {
  constructor(private props: OrderItemProps) {}

  get id() {
    return this.props.id;
  }

  get storeOrderId() {
    return this.props.storeOrderId;
  }

  get productId() {
    return this.props.productId;
  }

  get quantity() {
    return this.props.quantity;
  }

  set quantity(value: number) {
    this.props.quantity = value;
  }

  get unitPrice() {
    return this.props.unitPrice;
  }

  set unitPrice(value: number) {
    this.props.unitPrice = value;
  }

  get totalPrice() {
    return this.props.totalPrice;
  }

  set totalPrice(value: number) {
    this.props.totalPrice = value;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  set createdAt(value: Date) {
    this.props.createdAt = value;
  }

  toPublic(): PublicOrderItem {
    return {
      id: this.props.id,
      storeOrderId: this.props.storeOrderId,
      productId: this.props.productId,
      quantity: this.props.quantity,
      unitPrice: this.props.unitPrice,
      totalPrice: this.props.totalPrice,
      createdAt: this.props.createdAt.toISOString(),
    };
  }

  clone(): OrderItem {
    return new OrderItem({
      ...this.props,
    });
  }

  calculateTotalPrice(): number {
    return this.props.quantity * this.props.unitPrice;
  }

  updateQuantity(newQuantity: number): void {
    this.props.quantity = newQuantity;
    this.props.totalPrice = this.calculateTotalPrice();
  }
}
