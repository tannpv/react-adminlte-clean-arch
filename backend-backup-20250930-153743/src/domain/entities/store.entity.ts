export type StoreStatus = "pending" | "approved" | "suspended" | "rejected";

export interface StoreProps {
  id: number;
  userId: number;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  status: StoreStatus;
  commissionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicStore {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  status: StoreStatus;
  createdAt: string;
}

export class Store {
  constructor(private props: StoreProps) {}

  get id() {
    return this.props.id;
  }

  get userId() {
    return this.props.userId;
  }

  get name() {
    return this.props.name;
  }

  set name(value: string) {
    this.props.name = value;
  }

  get slug() {
    return this.props.slug;
  }

  set slug(value: string) {
    this.props.slug = value;
  }

  get description() {
    return this.props.description ?? null;
  }

  set description(value: string | null | undefined) {
    this.props.description = value ?? null;
  }

  get logoUrl() {
    return this.props.logoUrl ?? null;
  }

  set logoUrl(value: string | null | undefined) {
    this.props.logoUrl = value ?? null;
  }

  get bannerUrl() {
    return this.props.bannerUrl ?? null;
  }

  set bannerUrl(value: string | null | undefined) {
    this.props.bannerUrl = value ?? null;
  }

  get status() {
    return this.props.status;
  }

  set status(value: StoreStatus) {
    this.props.status = value;
  }

  get commissionRate() {
    return this.props.commissionRate;
  }

  set commissionRate(value: number) {
    this.props.commissionRate = value;
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

  toPublic(): PublicStore {
    return {
      id: this.props.id,
      name: this.props.name,
      slug: this.props.slug,
      description: this.props.description ?? null,
      logoUrl: this.props.logoUrl ?? null,
      bannerUrl: this.props.bannerUrl ?? null,
      status: this.props.status,
      createdAt: this.props.createdAt.toISOString(),
    };
  }

  clone(): Store {
    return new Store({
      ...this.props,
    });
  }

  isApproved(): boolean {
    return this.props.status === "approved";
  }

  isPending(): boolean {
    return this.props.status === "pending";
  }

  isSuspended(): boolean {
    return this.props.status === "suspended";
  }

  canSell(): boolean {
    return this.props.status === "approved";
  }
}
