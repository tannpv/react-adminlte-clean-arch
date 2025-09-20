import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common'
import { ProductAttributesService } from '../../../application/services/product-attributes.service'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { PermissionsGuard } from '../guards/permissions.guard'
import { RequireAnyPermission, RequirePermissions } from '../decorators/permissions.decorator'
import { CreateProductAttributeDto, CreateProductAttributeTermDto } from '../../../application/dto/create-product-attribute.dto'
import { UpdateProductAttributeDto, UpdateProductAttributeTermDto } from '../../../application/dto/update-product-attribute.dto'

@Controller('product-attributes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductAttributesController {
  constructor(private readonly attributes: ProductAttributesService) {}

  @Get()
  @RequireAnyPermission('product-attributes:read', 'products:read')
  list() {
    return this.attributes.list()
  }

  @Post()
  @RequirePermissions('product-attributes:create')
  create(@Body() dto: CreateProductAttributeDto) {
    return this.attributes.create(dto)
  }

  @Put(':id')
  @RequirePermissions('product-attributes:update')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductAttributeDto) {
    return this.attributes.update(id, dto)
  }

  @Delete(':id')
  @RequirePermissions('product-attributes:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attributes.remove(id)
  }

  @Post(':id/terms')
  @RequirePermissions('product-attributes:update')
  createTerm(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProductAttributeTermDto,
  ) {
    return this.attributes.addTerm(id, dto)
  }

  @Put(':attributeId/terms/:termId')
  @RequirePermissions('product-attributes:update')
  updateTerm(
    @Param('attributeId', ParseIntPipe) attributeId: number,
    @Param('termId', ParseIntPipe) termId: number,
    @Body() dto: UpdateProductAttributeTermDto,
  ) {
    return this.attributes.updateTerm(attributeId, termId, dto)
  }

  @Delete(':attributeId/terms/:termId')
  @RequirePermissions('product-attributes:update')
  removeTerm(
    @Param('attributeId', ParseIntPipe) attributeId: number,
    @Param('termId', ParseIntPipe) termId: number,
  ) {
    return this.attributes.removeTerm(attributeId, termId)
  }
}
