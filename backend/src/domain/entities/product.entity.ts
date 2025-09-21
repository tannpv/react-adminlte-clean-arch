import { Category } from "./category.entity";

export type ProductStatus = "draft" | "published" | "archived";
export type ProductType = "simple" | "variable";

export interface ProductProps {
  id: number;
  sku: string;
  name: string;
  description?: string | null;
  priceCents: number;
  currency: string;
  status: ProductStatus;
  metadata?: Record<string, unknown> | null;
  categories: Category[];
  type: ProductType;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  constructor(private props: ProductProps) {}

  get id() {
    return this.props.id;
  }
  get sku() {
    return this.props.sku;
  }
  set sku(value: string) {
    this.props.sku = value;
  }
  get name() {
    return this.props.name;
  }
  set name(value: string) {
    this.props.name = value;
  }
  get description() {
    return this.props.description ?? null;
  }
  set description(value: string | null | undefined) {
    this.props.description = value ?? null;
  }
  get priceCents() {
    return this.props.priceCents;
  }
  set priceCents(value: number) {
    this.props.priceCents = value;
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
  set status(value: ProductStatus) {
    this.props.status = value;
  }
  get metadata() {
    return this.props.metadata ?? null;
  }
  set metadata(value: Record<string, unknown> | null | undefined) {
    this.props.metadata = value ?? null;
  }
  get categories() {
    return this.props.categories.map((category) => category.clone());
  }
  set categories(categories: Category[]) {
    this.props.categories = categories.map((category) => category.clone());
  }
  get categoryIds() {
    return this.props.categories.map((category) => category.id);
  }
  get type() {
    return this.props.type;
  }
  set type(value: ProductType) {
    this.props.type = value;
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

  clone(): Product {
    return new Product({
      ...this.props,
      metadata: this.props.metadata ? { ...this.props.metadata } : null,
      categories: this.props.categories.map((category) => category.clone()),
    });
  }
}
