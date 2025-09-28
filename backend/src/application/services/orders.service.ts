import { Inject, Injectable } from "@nestjs/common";
import { Commission } from "../../domain/entities/commission.entity";
import { OrderItem } from "../../domain/entities/order-item.entity";
import { ParentOrder } from "../../domain/entities/parent-order.entity";
import { StoreOrder } from "../../domain/entities/store-order.entity";
import { Store } from "../../domain/entities/store.entity";
import {
  COMMISSION_REPOSITORY,
  CommissionRepository,
} from "../../domain/repositories/commission.repository";
import {
  ORDER_ITEM_REPOSITORY,
  OrderItemRepository,
} from "../../domain/repositories/order-item.repository";
import {
  PARENT_ORDER_REPOSITORY,
  ParentOrderRepository,
} from "../../domain/repositories/parent-order.repository";
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from "../../domain/repositories/product.repository";
import {
  STORE_ORDER_REPOSITORY,
  StoreOrderRepository,
} from "../../domain/repositories/store-order.repository";
import {
  STORE_REPOSITORY,
  StoreRepository,
} from "../../domain/repositories/store.repository";
import { MysqlDatabaseService } from "../../infrastructure/persistence/mysql/mysql-database.service";

export interface CreateOrderDto {
  customerId: number;
  items: {
    productId: number;
    quantity: number;
  }[];
}

export interface OrderSummary {
  parentOrder: ParentOrder;
  storeOrders: Array<{
    storeOrder: StoreOrder;
    items: OrderItem[];
    store: Store;
  }>;
  totalAmount: number;
  totalStores: number;
}

export interface StoreOrderSummary {
  storeOrder: StoreOrder;
  items: OrderItem[];
  store: Store;
  totalAmount: number;
  itemCount: number;
}

@Injectable()
export class OrdersService {
  constructor(
    @Inject(PARENT_ORDER_REPOSITORY)
    private readonly parentOrderRepository: ParentOrderRepository,
    @Inject(STORE_ORDER_REPOSITORY)
    private readonly storeOrderRepository: StoreOrderRepository,
    @Inject(ORDER_ITEM_REPOSITORY)
    private readonly orderItemRepository: OrderItemRepository,
    @Inject(COMMISSION_REPOSITORY)
    private readonly commissionRepository: CommissionRepository,
    @Inject(STORE_REPOSITORY) private readonly storeRepository: StoreRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    private readonly db: MysqlDatabaseService
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderSummary> {
    // Group items by store
    const itemsByStore = new Map<
      number,
      Array<{ productId: number; quantity: number }>
    >();

    for (const item of createOrderDto.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      if (!product.storeId) {
        throw new Error(
          `Product ${product.name} is not associated with any store`
        );
      }

      if (!itemsByStore.has(product.storeId)) {
        itemsByStore.set(product.storeId, []);
      }
      itemsByStore.get(product.storeId)!.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    // Generate parent order number
    const parentOrderNumber =
      await this.parentOrderRepository.generateOrderNumber();

    // Create parent order
    const parentOrder = new ParentOrder({
      id: 0,
      customerId: createOrderDto.customerId,
      orderNumber: parentOrderNumber,
      totalAmount: 0, // Will be calculated
      currency: "USD",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdParentOrder = await this.parentOrderRepository.create(
      parentOrder
    );

    // Create store orders and calculate total
    let totalAmount = 0;
    const storeOrderSummaries: Array<{
      storeOrder: StoreOrder;
      items: OrderItem[];
      store: Store;
    }> = [];

    for (const [storeId, items] of itemsByStore) {
      const store = await this.storeRepository.findById(storeId);
      if (!store) {
        throw new Error(`Store with ID ${storeId} not found`);
      }

      if (!store.canSell()) {
        throw new Error(`Store ${store.name} is not approved for selling`);
      }

      // Generate store order number
      const storeOrderNumber =
        await this.storeOrderRepository.generateOrderNumber(
          createdParentOrder.id,
          storeId
        );

      // Create store order
      const storeOrder = new StoreOrder({
        id: 0,
        parentOrderId: createdParentOrder.id,
        customerId: createOrderDto.customerId,
        storeId: storeId,
        orderNumber: storeOrderNumber,
        status: "pending",
        totalAmount: 0, // Will be calculated
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createdStoreOrder = await this.storeOrderRepository.create(
        storeOrder
      );

      // Create order items and calculate store total
      let storeTotal = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const product = await this.productRepository.findById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        const unitPrice = product.priceCents / 100; // Convert cents to dollars
        const totalPrice = unitPrice * item.quantity;

        const orderItem = new OrderItem({
          id: 0,
          storeOrderId: createdStoreOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: unitPrice,
          totalPrice: totalPrice,
          createdAt: new Date(),
        });

        const createdOrderItem = await this.orderItemRepository.create(
          orderItem
        );
        orderItems.push(createdOrderItem);

        storeTotal += totalPrice;

        // Create commission record
        const commissionAmount = (totalPrice * store.commissionRate) / 100;
        const commission = new Commission({
          id: 0,
          orderItemId: createdOrderItem.id,
          storeId: storeId,
          commissionRate: store.commissionRate,
          commissionAmount: commissionAmount,
          status: "pending",
          paidAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await this.commissionRepository.create(commission);
      }

      // Update store order with calculated total
      const updatedStoreOrder = new StoreOrder({
        ...createdStoreOrder,
        totalAmount: storeTotal,
      });
      await this.storeOrderRepository.update(
        createdStoreOrder.id,
        updatedStoreOrder
      );

      storeOrderSummaries.push({
        storeOrder: updatedStoreOrder,
        items: orderItems,
        store: store,
      });

      totalAmount += storeTotal;
    }

    // Update parent order with calculated total
    const updatedParentOrder = new ParentOrder({
      ...createdParentOrder,
      totalAmount: totalAmount,
    });
    await this.parentOrderRepository.update(
      createdParentOrder.id,
      updatedParentOrder
    );

    return {
      parentOrder: updatedParentOrder,
      storeOrders: storeOrderSummaries,
      totalAmount: totalAmount,
      totalStores: storeOrderSummaries.length,
    };
  }

  async findOrderById(id: number): Promise<OrderSummary | null> {
    const parentOrder = await this.parentOrderRepository.findById(id);
    if (!parentOrder) {
      return null;
    }

    const storeOrders = await this.storeOrderRepository.findByParentOrderId(id);
    const storeOrderSummaries: Array<{
      storeOrder: StoreOrder;
      items: OrderItem[];
      store: Store;
    }> = [];

    for (const storeOrder of storeOrders) {
      const items = await this.orderItemRepository.findByStoreOrderId(
        storeOrder.id
      );
      const store = await this.storeRepository.findById(storeOrder.storeId);

      if (store) {
        storeOrderSummaries.push({
          storeOrder,
          items,
          store,
        });
      }
    }

    return {
      parentOrder,
      storeOrders: storeOrderSummaries,
      totalAmount: parentOrder.totalAmount,
      totalStores: storeOrderSummaries.length,
    };
  }

  async findOrderByNumber(orderNumber: string): Promise<OrderSummary | null> {
    const parentOrder = await this.parentOrderRepository.findByOrderNumber(
      orderNumber
    );
    if (!parentOrder) {
      return null;
    }

    return this.findOrderById(parentOrder.id);
  }

  async findOrdersByCustomerId(
    customerId: number,
    limit?: number,
    offset?: number
  ): Promise<ParentOrder[]> {
    return await this.parentOrderRepository.findByCustomerId(
      customerId,
      limit,
      offset
    );
  }

  async findStoreOrdersByStoreId(
    storeId: number,
    limit?: number,
    offset?: number
  ): Promise<StoreOrderSummary[]> {
    const storeOrders = await this.storeOrderRepository.findByStoreId(
      storeId,
      limit,
      offset
    );
    const storeOrderSummaries: StoreOrderSummary[] = [];

    for (const storeOrder of storeOrders) {
      const items = await this.orderItemRepository.findByStoreOrderId(
        storeOrder.id
      );
      const store = await this.storeRepository.findById(storeOrder.storeId);

      if (store) {
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        storeOrderSummaries.push({
          storeOrder,
          items,
          store,
          totalAmount: storeOrder.totalAmount,
          itemCount,
        });
      }
    }

    return storeOrderSummaries;
  }

  async updateStoreOrderStatus(
    storeOrderId: number,
    status: string
  ): Promise<StoreOrder | null> {
    const storeOrder = await this.storeOrderRepository.findById(storeOrderId);
    if (!storeOrder) {
      return null;
    }

    const updatedStoreOrder = new StoreOrder({
      ...storeOrder,
      status: status as any,
    });

    return await this.storeOrderRepository.update(
      storeOrderId,
      updatedStoreOrder
    );
  }

  async updateParentOrderStatus(
    parentOrderId: number,
    status: string
  ): Promise<ParentOrder | null> {
    const parentOrder = await this.parentOrderRepository.findById(
      parentOrderId
    );
    if (!parentOrder) {
      return null;
    }

    const updatedParentOrder = new ParentOrder({
      ...parentOrder,
      status: status as any,
    });

    return await this.parentOrderRepository.update(
      parentOrderId,
      updatedParentOrder
    );
  }

  async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  }> {
    const totalOrders = await this.parentOrderRepository.count();

    // Get revenue from completed orders
    const [revenueRows] = await this.db.execute(
      `SELECT SUM(total_amount) as total FROM parent_orders WHERE status = 'completed'`
    );
    const totalRevenue = Number((revenueRows as any)[0]?.total ?? 0);

    // Get counts by status
    const [pendingRows] = await this.db.execute(
      `SELECT COUNT(*) as count FROM parent_orders WHERE status = 'pending'`
    );
    const pendingOrders = Number((pendingRows as any)[0]?.count ?? 0);

    const [completedRows] = await this.db.execute(
      `SELECT COUNT(*) as count FROM parent_orders WHERE status = 'completed'`
    );
    const completedOrders = Number((completedRows as any)[0]?.count ?? 0);

    const [cancelledRows] = await this.db.execute(
      `SELECT COUNT(*) as count FROM parent_orders WHERE status = 'cancelled'`
    );
    const cancelledOrders = Number((cancelledRows as any)[0]?.count ?? 0);

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      cancelledOrders,
    };
  }
}
