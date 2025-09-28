import { Injectable } from "@nestjs/common";
import { Store, StoreProps } from "../../../domain/entities/store.entity";
import { StoreRepository } from "../../../domain/repositories/store.repository";
import { MysqlDatabaseService } from "./mysql-database.service";

@Injectable()
export class MysqlStoreRepository implements StoreRepository {
  constructor(private readonly db: MysqlDatabaseService) {}

  async findById(id: number): Promise<Store | null> {
    const [rows] = await this.db.execute(`SELECT * FROM stores WHERE id = ?`, [
      id,
    ]);

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const row = rows[0] as any;
    return this.mapRowToStore(row);
  }

  async findBySlug(slug: string): Promise<Store | null> {
    const [rows] = await this.db.execute(
      `SELECT * FROM stores WHERE slug = ?`,
      [slug]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }

    const row = rows[0] as any;
    return this.mapRowToStore(row);
  }

  async findByUserId(userId: number): Promise<Store[]> {
    const [rows] = await this.db.execute(
      `SELECT * FROM stores WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map((row: any) => this.mapRowToStore(row));
  }

  async findByStatus(status: string): Promise<Store[]> {
    const [rows] = await this.db.execute(
      `SELECT * FROM stores WHERE status = ? ORDER BY created_at DESC`,
      [status]
    );

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map((row: any) => this.mapRowToStore(row));
  }

  async findAll(limit?: number, offset?: number): Promise<Store[]> {
    let query = `SELECT * FROM stores ORDER BY created_at DESC`;
    const params: any[] = [];

    if (limit !== undefined) {
      query += ` LIMIT ?`;
      params.push(limit);

      if (offset !== undefined) {
        query += ` OFFSET ?`;
        params.push(offset);
      }
    }

    const [rows] = await this.db.execute(query, params);

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map((row: any) => this.mapRowToStore(row));
  }

  async create(
    store: Omit<Store, "id" | "createdAt" | "updatedAt">
  ): Promise<Store> {
    const [result] = await this.db.execute(
      `INSERT INTO stores (user_id, name, slug, description, logo_url, banner_url, status, commission_rate, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        store.userId,
        store.name,
        store.slug,
        store.description,
        store.logoUrl,
        store.bannerUrl,
        store.status,
        store.commissionRate,
      ]
    );

    const insertResult = result as any;
    const newId = insertResult.insertId;

    // Create default store settings
    await this.db.execute(
      `INSERT INTO store_settings (store_id, currency, timezone, auto_approve_products, allow_custom_attributes, created_at, updated_at)
       VALUES (?, 'USD', 'UTC', FALSE, TRUE, NOW(), NOW())`,
      [newId]
    );

    const createdStore = await this.findById(newId);
    if (!createdStore) {
      throw new Error("Failed to create store");
    }

    return createdStore;
  }

  async update(id: number, store: Partial<Store>): Promise<Store | null> {
    const existingStore = await this.findById(id);
    if (!existingStore) {
      return null;
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (store.name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(store.name);
    }
    if (store.slug !== undefined) {
      updateFields.push("slug = ?");
      updateValues.push(store.slug);
    }
    if (store.description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(store.description);
    }
    if (store.logoUrl !== undefined) {
      updateFields.push("logo_url = ?");
      updateValues.push(store.logoUrl);
    }
    if (store.bannerUrl !== undefined) {
      updateFields.push("banner_url = ?");
      updateValues.push(store.bannerUrl);
    }
    if (store.status !== undefined) {
      updateFields.push("status = ?");
      updateValues.push(store.status);
    }
    if (store.commissionRate !== undefined) {
      updateFields.push("commission_rate = ?");
      updateValues.push(store.commissionRate);
    }

    if (updateFields.length === 0) {
      return existingStore;
    }

    updateFields.push("updated_at = NOW()");
    updateValues.push(id);

    await this.db.execute(
      `UPDATE stores SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await this.db.execute(`DELETE FROM stores WHERE id = ?`, [
      id,
    ]);
    const deleteResult = result as any;
    return deleteResult.affectedRows > 0;
  }

  async count(): Promise<number> {
    const [rows] = await this.db.execute(
      `SELECT COUNT(*) as count FROM stores`
    );
    const result = rows as any[];
    return Number(result[0]?.count ?? 0);
  }

  async countByStatus(status: string): Promise<number> {
    const [rows] = await this.db.execute(
      `SELECT COUNT(*) as count FROM stores WHERE status = ?`,
      [status]
    );
    const result = rows as any[];
    return Number(result[0]?.count ?? 0);
  }

  private mapRowToStore(row: any): Store {
    const props: StoreProps = {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      logoUrl: row.logo_url,
      bannerUrl: row.banner_url,
      status: row.status,
      commissionRate: Number(row.commission_rate),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return new Store(props);
  }
}
