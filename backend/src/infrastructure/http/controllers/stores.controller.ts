import {
  Body,
  Controller,
  Delete,
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
  CreateStoreDto,
  StoreApprovalDto,
  StoresService,
  UpdateStoreDto,
} from "../../../application/services/stores.service";
import { RequirePermissions } from "../decorators/permissions.decorator";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { PermissionsGuard } from "../guards/permissions.guard";
import { AuthenticatedRequest } from "../interfaces/authenticated-request";

@Controller("stores")
@UseGuards(JwtAuthGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions({ any: ["stores:create"] })
  @UseGuards(PermissionsGuard)
  async createStore(
    @Body() createStoreDto: CreateStoreDto,
    @Req() req: AuthenticatedRequest
  ) {
    // Set the user ID from the authenticated request
    const storeData = {
      ...createStoreDto,
      userId: req.userId,
    };

    const store = await this.storesService.createStore(storeData);
    return {
      success: true,
      data: store.toPublic(),
      message: "Store created successfully",
    };
  }

  @Get()
  @RequirePermissions({ any: ["stores:read"] })
  @UseGuards(PermissionsGuard)
  async findAllStores(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const offsetNum = offset ? parseInt(offset, 10) : undefined;

    const stores = await this.storesService.findAllStores(limitNum, offsetNum);
    return {
      success: true,
      data: stores.map((store) => store.toPublic()),
      message: "Stores retrieved successfully",
    };
  }

  @Get("pending")
  @RequirePermissions({ any: ["stores:read", "stores:approve"] })
  @UseGuards(PermissionsGuard)
  async findPendingStores() {
    const stores = await this.storesService.findPendingStores();
    return {
      success: true,
      data: stores.map((store) => store.toPublic()),
      message: "Pending stores retrieved successfully",
    };
  }

  @Get("approved")
  @RequirePermissions({ any: ["stores:read"] })
  @UseGuards(PermissionsGuard)
  async findApprovedStores() {
    const stores = await this.storesService.findApprovedStores();
    return {
      success: true,
      data: stores.map((store) => store.toPublic()),
      message: "Approved stores retrieved successfully",
    };
  }

  @Get("stats")
  @RequirePermissions({ any: ["stores:read", "analytics:read"] })
  @UseGuards(PermissionsGuard)
  async getStoreStats() {
    const stats = await this.storesService.getStoreStats();
    return {
      success: true,
      data: stats,
      message: "Store statistics retrieved successfully",
    };
  }

  @Get("my-stores")
  @RequirePermissions({ any: ["stores:read"] })
  @UseGuards(PermissionsGuard)
  async findMyStores(@Req() req: AuthenticatedRequest) {
    const stores = await this.storesService.findStoresByUserId(req.userId);
    return {
      success: true,
      data: stores.map((store) => store.toPublic()),
      message: "Your stores retrieved successfully",
    };
  }

  @Get("slug/:slug")
  @RequirePermissions({ any: ["stores:read"] })
  @UseGuards(PermissionsGuard)
  async findStoreBySlug(@Param("slug") slug: string) {
    const store = await this.storesService.findStoreBySlug(slug);
    if (!store) {
      return {
        success: false,
        message: "Store not found",
      };
    }

    return {
      success: true,
      data: store.toPublic(),
      message: "Store retrieved successfully",
    };
  }

  @Get(":id")
  @RequirePermissions({ any: ["stores:read"] })
  @UseGuards(PermissionsGuard)
  async findStoreById(@Param("id", ParseIntPipe) id: number) {
    const store = await this.storesService.findStoreById(id);
    if (!store) {
      return {
        success: false,
        message: "Store not found",
      };
    }

    return {
      success: true,
      data: store.toPublic(),
      message: "Store retrieved successfully",
    };
  }

  @Put(":id")
  @RequirePermissions({ any: ["stores:update"] })
  @UseGuards(PermissionsGuard)
  async updateStore(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateStoreDto: UpdateStoreDto,
    @Req() req: AuthenticatedRequest
  ) {
    // Check if user owns the store or has admin permissions
    const store = await this.storesService.findStoreById(id);
    if (!store) {
      return {
        success: false,
        message: "Store not found",
      };
    }

    // Only allow store owner or admin to update
    if (store.userId !== req.userId) {
      // Check if user has admin permissions
      // This would need to be implemented with proper permission checking
      return {
        success: false,
        message: "You can only update your own store",
      };
    }

    const updatedStore = await this.storesService.updateStore(
      id,
      updateStoreDto
    );
    if (!updatedStore) {
      return {
        success: false,
        message: "Failed to update store",
      };
    }

    return {
      success: true,
      data: updatedStore.toPublic(),
      message: "Store updated successfully",
    };
  }

  @Put(":id/approve")
  @RequirePermissions({ any: ["stores:approve"] })
  @UseGuards(PermissionsGuard)
  async approveStore(
    @Param("id", ParseIntPipe) id: number,
    @Body() approvalDto: StoreApprovalDto
  ) {
    const store = await this.storesService.approveStore(id, approvalDto);
    if (!store) {
      return {
        success: false,
        message: "Store not found",
      };
    }

    return {
      success: true,
      data: store.toPublic(),
      message: `Store ${approvalDto.status} successfully`,
    };
  }

  @Delete(":id")
  @RequirePermissions({ any: ["stores:delete"] })
  @UseGuards(PermissionsGuard)
  async deleteStore(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest
  ) {
    // Check if user owns the store or has admin permissions
    const store = await this.storesService.findStoreById(id);
    if (!store) {
      return {
        success: false,
        message: "Store not found",
      };
    }

    // Only allow store owner or admin to delete
    if (store.userId !== req.userId) {
      return {
        success: false,
        message: "You can only delete your own store",
      };
    }

    const deleted = await this.storesService.deleteStore(id);
    if (!deleted) {
      return {
        success: false,
        message: "Failed to delete store",
      };
    }

    return {
      success: true,
      message: "Store deleted successfully",
    };
  }
}
