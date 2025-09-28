import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  CreateOrderDto,
  OrdersService,
} from "../../../application/services/orders.service";
import { RequirePermissions } from "../decorators/permissions.decorator";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { PermissionsGuard } from "../guards/permissions.guard";
import { AuthenticatedRequest } from "../interfaces/authenticated-request";

@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions({ any: ["orders:create"] })
  @UseGuards(PermissionsGuard)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: AuthenticatedRequest
  ) {
    // Set the customer ID from the authenticated request
    const orderData = {
      ...createOrderDto,
      customerId: req.userId,
    };

    const order = await this.ordersService.createOrder(orderData);
    return {
      success: true,
      data: {
        parentOrder: order.parentOrder.toPublic(),
        storeOrders: order.storeOrders.map((so) => ({
          storeOrder: so.storeOrder.toPublic(),
          items: so.items.map((item) => item.toPublic()),
          store: so.store.toPublic(),
        })),
        totalAmount: order.totalAmount,
        totalStores: order.totalStores,
      },
      message: "Order created successfully",
    };
  }

  @Get()
  @RequirePermissions({ any: ["orders:read"] })
  @UseGuards(PermissionsGuard)
  async findAllOrders(
    @Req() req: AuthenticatedRequest,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const offsetNum = offset ? parseInt(offset, 10) : undefined;

    const orders = await this.ordersService.findOrdersByCustomerId(
      req.userId,
      limitNum,
      offsetNum
    );
    return {
      success: true,
      data: orders.map((order) => order.toPublic()),
      message: "Orders retrieved successfully",
    };
  }

  @Get("my-orders")
  @RequirePermissions({ any: ["orders:read"] })
  @UseGuards(PermissionsGuard)
  async findMyOrders(
    @Req() req: AuthenticatedRequest,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const offsetNum = offset ? parseInt(offset, 10) : undefined;

    const orders = await this.ordersService.findOrdersByCustomerId(
      req.userId,
      limitNum,
      offsetNum
    );
    return {
      success: true,
      data: orders.map((order) => order.toPublic()),
      message: "Your orders retrieved successfully",
    };
  }

  @Get("store/:storeId")
  @RequirePermissions({ any: ["orders:read"] })
  @UseGuards(PermissionsGuard)
  async findStoreOrders(
    @Param("storeId", ParseIntPipe) storeId: number,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const offsetNum = offset ? parseInt(offset, 10) : undefined;

    const storeOrders = await this.ordersService.findStoreOrdersByStoreId(
      storeId,
      limitNum,
      offsetNum
    );
    return {
      success: true,
      data: storeOrders.map((so) => ({
        storeOrder: so.storeOrder.toPublic(),
        items: so.items.map((item) => item.toPublic()),
        store: so.store.toPublic(),
        totalAmount: so.totalAmount,
        itemCount: so.itemCount,
      })),
      message: "Store orders retrieved successfully",
    };
  }

  @Get("stats")
  @RequirePermissions({ any: ["orders:read", "analytics:read"] })
  @UseGuards(PermissionsGuard)
  async getOrderStats() {
    const stats = await this.ordersService.getOrderStats();
    return {
      success: true,
      data: stats,
      message: "Order statistics retrieved successfully",
    };
  }

  @Get("number/:orderNumber")
  @RequirePermissions({ any: ["orders:read"] })
  @UseGuards(PermissionsGuard)
  async findOrderByNumber(@Param("orderNumber") orderNumber: string) {
    const order = await this.ordersService.findOrderByNumber(orderNumber);
    if (!order) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    return {
      success: true,
      data: {
        parentOrder: order.parentOrder.toPublic(),
        storeOrders: order.storeOrders.map((so) => ({
          storeOrder: so.storeOrder.toPublic(),
          items: so.items.map((item) => item.toPublic()),
          store: so.store.toPublic(),
        })),
        totalAmount: order.totalAmount,
        totalStores: order.totalStores,
      },
      message: "Order retrieved successfully",
    };
  }

  @Get(":id")
  @RequirePermissions({ any: ["orders:read"] })
  @UseGuards(PermissionsGuard)
  async findOrderById(@Param("id", ParseIntPipe) id: number) {
    const order = await this.ordersService.findOrderById(id);
    if (!order) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    return {
      success: true,
      data: {
        parentOrder: order.parentOrder.toPublic(),
        storeOrders: order.storeOrders.map((so) => ({
          storeOrder: so.storeOrder.toPublic(),
          items: so.items.map((item) => item.toPublic()),
          store: so.store.toPublic(),
        })),
        totalAmount: order.totalAmount,
        totalStores: order.totalStores,
      },
      message: "Order retrieved successfully",
    };
  }

  @Put(":id/status")
  @RequirePermissions({ any: ["orders:update"] })
  @UseGuards(PermissionsGuard)
  async updateOrderStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { status: string }
  ) {
    const order = await this.ordersService.updateParentOrderStatus(
      id,
      body.status
    );
    if (!order) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    return {
      success: true,
      data: order.toPublic(),
      message: "Order status updated successfully",
    };
  }

  @Put("store/:storeOrderId/status")
  @RequirePermissions({ any: ["orders:update"] })
  @UseGuards(PermissionsGuard)
  async updateStoreOrderStatus(
    @Param("storeOrderId", ParseIntPipe) storeOrderId: number,
    @Body() body: { status: string }
  ) {
    const storeOrder = await this.ordersService.updateStoreOrderStatus(
      storeOrderId,
      body.status
    );
    if (!storeOrder) {
      return {
        success: false,
        message: "Store order not found",
      };
    }

    return {
      success: true,
      data: storeOrder.toPublic(),
      message: "Store order status updated successfully",
    };
  }
}
