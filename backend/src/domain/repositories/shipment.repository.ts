import { Shipment } from "../entities/shipment.entity";

export const SHIPMENT_REPOSITORY = Symbol("SHIPMENT_REPOSITORY");

export interface ShipmentRepository {
  findById(id: number): Promise<Shipment | null>;
  findByStoreOrderId(storeOrderId: number): Promise<Shipment | null>;
  findByTrackingNumber(trackingNumber: string): Promise<Shipment | null>;
  findByStatus(
    status: string,
    limit?: number,
    offset?: number
  ): Promise<Shipment[]>;
  findAll(limit?: number, offset?: number): Promise<Shipment[]>;
  create(
    shipment: Omit<Shipment, "id" | "createdAt" | "updatedAt">
  ): Promise<Shipment>;
  update(id: number, shipment: Partial<Shipment>): Promise<Shipment | null>;
  delete(id: number): Promise<boolean>;
  count(): Promise<number>;
  countByStatus(status: string): Promise<number>;
}
