import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from "@nestjs/common";
import { AttributeResponseDto } from "../../../application/dto/attribute-response.dto";
import { CreateAttributeDto } from "../../../application/dto/create-attribute.dto";
import { UpdateAttributeDto } from "../../../application/dto/update-attribute.dto";
import { AttributesService } from "../../../application/services/attributes.service";

@Controller("attributes")
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Get()
  async findAll(): Promise<AttributeResponseDto[]> {
    return this.attributesService.findAll();
  }

  @Get(":id")
  async findById(
    @Param("id", ParseIntPipe) id: number
  ): Promise<AttributeResponseDto> {
    return this.attributesService.findById(id);
  }

  @Post()
  async create(
    @Body() createAttributeDto: CreateAttributeDto
  ): Promise<AttributeResponseDto> {
    return this.attributesService.create(createAttributeDto);
  }

  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAttributeDto: UpdateAttributeDto
  ): Promise<AttributeResponseDto> {
    return this.attributesService.update(id, updateAttributeDto);
  }

  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.attributesService.delete(id);
  }
}
