import { Inject, Injectable } from "@nestjs/common";
import { Store, StoreStatus } from "../../domain/entities/store.entity";
import {
  STORE_REPOSITORY,
  StoreRepository,
} from "../../domain/repositories/store.repository";

export interface CreateStoreDto {
  userId: number;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  commissionRate?: number;
}

export interface UpdateStoreDto {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  commissionRate?: number;
}

export interface StoreApprovalDto {
  status: StoreStatus;
  reason?: string;
}

@Injectable()
export class StoresService {
  constructor(
    @Inject(STORE_REPOSITORY) private readonly storeRepository: StoreRepository
  ) {}

  async createStore(createStoreDto: CreateStoreDto): Promise<Store> {
    // Check if slug is already taken
    const existingStore = await this.storeRepository.findBySlug(
      createStoreDto.slug
    );
    if (existingStore) {
      throw new Error("Store slug already exists");
    }

    // Check if user already has a store
    const userStores = await this.storeRepository.findByUserId(
      createStoreDto.userId
    );
    if (userStores.length > 0) {
      throw new Error("User already has a store");
    }

    const store = new Store({
      id: 0, // Will be set by repository
      userId: createStoreDto.userId,
      name: createStoreDto.name,
      slug: createStoreDto.slug,
      description: createStoreDto.description || null,
      logoUrl: createStoreDto.logoUrl || null,
      bannerUrl: createStoreDto.bannerUrl || null,
      status: "pending",
      commissionRate: createStoreDto.commissionRate || 10.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.storeRepository.create(store);
  }

  async findStoreById(id: number): Promise<Store | null> {
    return await this.storeRepository.findById(id);
  }

  async findStoreBySlug(slug: string): Promise<Store | null> {
    return await this.storeRepository.findBySlug(slug);
  }

  async findStoresByUserId(userId: number): Promise<Store[]> {
    return await this.storeRepository.findByUserId(userId);
  }

  async findAllStores(limit?: number, offset?: number): Promise<Store[]> {
    return await this.storeRepository.findAll(limit, offset);
  }

  async findPendingStores(): Promise<Store[]> {
    return await this.storeRepository.findByStatus("pending");
  }

  async findApprovedStores(): Promise<Store[]> {
    return await this.storeRepository.findByStatus("approved");
  }

  async updateStore(
    id: number,
    updateStoreDto: UpdateStoreDto
  ): Promise<Store | null> {
    const existingStore = await this.storeRepository.findById(id);
    if (!existingStore) {
      return null;
    }

    // Check if new slug is already taken (if slug is being updated)
    if (updateStoreDto.slug && updateStoreDto.slug !== existingStore.slug) {
      const storeWithSlug = await this.storeRepository.findBySlug(
        updateStoreDto.slug
      );
      if (storeWithSlug) {
        throw new Error("Store slug already exists");
      }
    }

    const updatedStore = new Store({
      ...existingStore,
      name: updateStoreDto.name ?? existingStore.name,
      slug: updateStoreDto.slug ?? existingStore.slug,
      description: updateStoreDto.description ?? existingStore.description,
      logoUrl: updateStoreDto.logoUrl ?? existingStore.logoUrl,
      bannerUrl: updateStoreDto.bannerUrl ?? existingStore.bannerUrl,
      commissionRate:
        updateStoreDto.commissionRate ?? existingStore.commissionRate,
      updatedAt: new Date(),
    });

    return await this.storeRepository.update(id, updatedStore);
  }

  async approveStore(
    id: number,
    approvalDto: StoreApprovalDto
  ): Promise<Store | null> {
    const store = await this.storeRepository.findById(id);
    if (!store) {
      return null;
    }

    const updatedStore = new Store({
      ...store,
      status: approvalDto.status,
      updatedAt: new Date(),
    });

    return await this.storeRepository.update(id, updatedStore);
  }

  async deleteStore(id: number): Promise<boolean> {
    return await this.storeRepository.delete(id);
  }

  async getStoreStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    suspended: number;
    rejected: number;
  }> {
    const total = await this.storeRepository.count();
    const pending = await this.storeRepository.countByStatus("pending");
    const approved = await this.storeRepository.countByStatus("approved");
    const suspended = await this.storeRepository.countByStatus("suspended");
    const rejected = await this.storeRepository.countByStatus("rejected");

    return {
      total,
      pending,
      approved,
      suspended,
      rejected,
    };
  }

  async generateStoreSlug(name: string): Promise<string> {
    // Convert name to slug format
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();

    // Check if slug exists and append number if needed
    let finalSlug = slug;
    let counter = 1;

    while (await this.storeRepository.findBySlug(finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    return finalSlug;
  }
}
