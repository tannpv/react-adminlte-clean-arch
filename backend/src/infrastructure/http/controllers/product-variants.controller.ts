import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { CreateProductVariantDto } from "../../../application/dto/create-product-variant.dto";
import { UpdateProductVariantDto } from "../../../application/dto/update-product-variant.dto";
import { ProductVariantsService } from "../../../application/services/product-variants.service";
import {
  RequireAnyPermission,
  RequirePermissions,
} from "../decorators/permissions.decorator";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { PermissionsGuard } from "../guards/permissions.guard";

@Controller("product-variants")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductVariantsController {
  constructor(private readonly productVariantsService: ProductVariantsService) {}

  @Get()
  @RequireAnyPermission("products:read", "users:read")
  async findAll(@Query("productId") productId?: string) {
    if (productId) {
      return this.productVariantsService.findByProductId(parseInt(productId));
    }
    return this.productVariantsService.findAll();
  }

  @Get(":id")
  @RequireAnyPermission("products:read", "users:read")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.productVariantsService.findOne(id);
  }

  @Get(":id/attribute-values")
  @RequireAnyPermission("products:read", "users:read")
  async getVariantAttributeValues(@Param("id", ParseIntPipe) id: number) {
    return this.productVariantsService.getVariantAttributeValues(id);
  }

  @Post()
  @RequirePermissions("products:create")
  @UsePipes(new ValidationPipe({ whitelist: false, transform: true }))
  async create(@Body() dto: CreateProductVariantDto) {
    return this.productVariantsService.create(dto);
  }

  @Put(":id")
  @RequirePermissions("products:update")
  @UsePipes(new ValidationPipe({ whitelist: false, transform: true }))
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateProductVariantDto
  ) {
    return this.productVariantsService.update(id, dto);
  }

  @Delete(":id")
  @RequirePermissions("products:delete")
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.productVariantsService.remove(id);
  }

  @Post(":id/attribute-values")
  @RequirePermissions("products:update")
  @UsePipes(new ValidationPipe({ whitelist: false, transform: true }))
  async setVariantAttributeValues(
    @Param("id", ParseIntPipe) id: number,
    @Body() attributeValues: Record<string, any>
  ) {
    return this.productVariantsService.setVariantAttributeValues(id, attributeValues);
  }

  @Get("product/:productId/generate")
  @RequirePermissions("products:create")
  async generateVariants(@Param("productId", ParseIntPipe) productId: number) {
    return this.productVariantsService.generateVariantsFromAttributes(productId);
  }
}
