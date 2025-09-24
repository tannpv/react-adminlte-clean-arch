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
import { CreateProductDto } from "../../../application/dto/create-product.dto";
import { UpdateProductDto } from "../../../application/dto/update-product.dto";
import { ProductsService } from "../../../application/services/products.service";
import {
  RequireAnyPermission,
  RequirePermissions,
} from "../decorators/permissions.decorator";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { PermissionsGuard } from "../guards/permissions.guard";

@Controller("products")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequireAnyPermission("products:read", "users:read")
  list(@Query("search") search?: string) {
    return this.productsService.list(search);
  }

  @Get(":id")
  @RequireAnyPermission("products:read", "users:read")
  getOne(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.findById(id);
  }

  @Get(":id/attribute-values")
  @RequireAnyPermission("products:read", "users:read")
  getProductAttributeValues(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.getProductAttributeValues(id);
  }

  @Get(":id/variants")
  @RequireAnyPermission("products:read", "users:read")
  getProductVariants(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.getProductVariants(id);
  }

  @Post()
  @RequirePermissions("products:create")
  @UsePipes(new ValidationPipe({ whitelist: false, transform: true }))
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(":id")
  @RequirePermissions("products:update")
  @UsePipes(new ValidationPipe({ whitelist: false, transform: true }))
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(":id")
  @RequirePermissions("products:delete")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
