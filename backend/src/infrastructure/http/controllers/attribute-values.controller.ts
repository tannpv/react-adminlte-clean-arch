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
import { AttributeValueResponseDto } from "../../../application/dto/attribute-value-response.dto";
import { CreateAttributeValueDto } from "../../../application/dto/create-attribute-value.dto";
import { UpdateAttributeValueDto } from "../../../application/dto/update-attribute-value.dto";
import { AttributeValuesService } from "../../../application/services/attribute-values.service";

@Controller("attribute-values")
export class AttributeValuesController {
  constructor(
    private readonly attributeValuesService: AttributeValuesService
  ) {}

  @Get()
  async findAll(): Promise<AttributeValueResponseDto[]> {
    return this.attributeValuesService.findAll();
  }

  @Get("by-attribute/:attributeId")
  async findByAttributeId(
    @Param("attributeId", ParseIntPipe) attributeId: number
  ): Promise<AttributeValueResponseDto[]> {
    return this.attributeValuesService.findByAttributeId(attributeId);
  }

  @Get(":id")
  async findById(
    @Param("id", ParseIntPipe) id: number
  ): Promise<AttributeValueResponseDto> {
    return this.attributeValuesService.findById(id);
  }

  @Post()
  async create(
    @Body() createAttributeValueDto: CreateAttributeValueDto
  ): Promise<AttributeValueResponseDto> {
    return this.attributeValuesService.create(createAttributeValueDto);
  }

  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAttributeValueDto: UpdateAttributeValueDto
  ): Promise<AttributeValueResponseDto> {
    return this.attributeValuesService.update(id, updateAttributeValueDto);
  }

  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.attributeValuesService.delete(id);
  }
}
