import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common'
import { ProductsService } from '../../../application/services/products.service'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { PermissionsGuard } from '../guards/permissions.guard'
import { RequireAnyPermission, RequirePermissions } from '../decorators/permissions.decorator'
import { CreateProductDto } from '../../../application/dto/create-product.dto'
import { UpdateProductDto } from '../../../application/dto/update-product.dto'

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequireAnyPermission('products:read', 'users:read')
  list() {
    return this.productsService.list()
  }

  @Get(':id')
  @RequireAnyPermission('products:read', 'users:read')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findById(id)
  }

  @Post()
  @RequirePermissions('products:create')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto)
  }

  @Put(':id')
  @RequirePermissions('products:update')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto)
  }

  @Delete(':id')
  @RequirePermissions('products:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id)
  }
}
