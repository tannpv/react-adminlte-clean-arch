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
import { AttributeSetResponseDto } from "../../../application/dto/attribute-set-response.dto";
import { CreateAttributeSetDto } from "../../../application/dto/create-attribute-set.dto";
import { UpdateAttributeSetDto } from "../../../application/dto/update-attribute-set.dto";
import { AttributeSetsService } from "../../../application/services/attribute-sets.service";

@Controller("attribute-sets")
export class AttributeSetsController {
  constructor(private readonly attributeSetsService: AttributeSetsService) {}

  @Get()
  async findAll(): Promise<AttributeSetResponseDto[]> {
    return this.attributeSetsService.findAll();
  }

  @Get("by-name/:name")
  async findByName(
    @Param("name") name: string
  ): Promise<AttributeSetResponseDto> {
    return this.attributeSetsService.findByName(name);
  }

  @Get(":id")
  async findById(
    @Param("id", ParseIntPipe) id: number
  ): Promise<AttributeSetResponseDto> {
    return this.attributeSetsService.findById(id);
  }

  @Post()
  async create(
    @Body() createAttributeSetDto: CreateAttributeSetDto
  ): Promise<AttributeSetResponseDto> {
    return this.attributeSetsService.create(createAttributeSetDto);
  }

  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAttributeSetDto: UpdateAttributeSetDto
  ): Promise<AttributeSetResponseDto> {
    return this.attributeSetsService.update(id, updateAttributeSetDto);
  }

  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.attributeSetsService.delete(id);
  }

  @Post(":id/attributes/:attributeId")
  async addAttributeToSet(
    @Param("id", ParseIntPipe) attributeSetId: number,
    @Param("attributeId", ParseIntPipe) attributeId: number,
    @Body() body: { sortOrder?: number; isRequired?: boolean }
  ): Promise<void> {
    return this.attributeSetsService.addAttributeToSet(
      attributeSetId,
      attributeId,
      body.sortOrder,
      body.isRequired
    );
  }

  @Delete(":id/attributes/:attributeId")
  async removeAttributeFromSet(
    @Param("id", ParseIntPipe) attributeSetId: number,
    @Param("attributeId", ParseIntPipe) attributeId: number
  ): Promise<void> {
    return this.attributeSetsService.removeAttributeFromSet(
      attributeSetId,
      attributeId
    );
  }
}
