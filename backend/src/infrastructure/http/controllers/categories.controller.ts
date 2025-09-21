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
} from "@nestjs/common";
import { CreateCategoryDto } from "../../../application/dto/create-category.dto";
import { UpdateCategoryDto } from "../../../application/dto/update-category.dto";
import { CategoriesService } from "../../../application/services/categories.service";
import {
  RequireAnyPermission,
  RequirePermissions,
} from "../decorators/permissions.decorator";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { PermissionsGuard } from "../guards/permissions.guard";

@Controller("categories")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @RequireAnyPermission("categories:read", "products:read", "users:read")
  list(@Query("search") search?: string) {
    return this.categoriesService.list(search);
  }

  @Post()
  @RequirePermissions("categories:create")
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Put(":id")
  @RequirePermissions("categories:update")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto
  ) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(":id")
  @RequirePermissions("categories:delete")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
