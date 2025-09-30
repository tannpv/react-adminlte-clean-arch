import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { PaginatedResponseDto, PaginationDto } from '../../../shared/dto';
import { CarrierResponseDto } from '../application/dto/carrier-response.dto';
import { CreateCarrierDto } from '../application/dto/create-carrier.dto';
import { UpdateCarrierDto } from '../application/dto/update-carrier.dto';
import { CarrierService } from '../application/services/carrier.service';

@Controller('carriers')
export class CarrierController {
  constructor(private readonly carrierService: CarrierService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCarrierDto: CreateCarrierDto): Promise<CarrierResponseDto> {
    return this.carrierService.create(createCarrierDto);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResponseDto<CarrierResponseDto>> {
    return this.carrierService.findAll(paginationDto);
  }

  @Get('active')
  async findActive(): Promise<CarrierResponseDto[]> {
    return this.carrierService.findActive();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CarrierResponseDto> {
    return this.carrierService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCarrierDto: UpdateCarrierDto,
  ): Promise<CarrierResponseDto> {
    return this.carrierService.update(id, updateCarrierDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.carrierService.remove(id);
  }
}
