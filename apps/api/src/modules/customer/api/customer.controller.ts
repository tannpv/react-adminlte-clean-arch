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
import { CreateCustomerDto } from '../application/dto/create-customer.dto';
import { CustomerResponseDto } from '../application/dto/customer-response.dto';
import { UpdateCustomerDto } from '../application/dto/update-customer.dto';
import { CustomerService } from '../application/services/customer.service';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResponseDto<CustomerResponseDto>> {
    return this.customerService.findAll(paginationDto);
  }

  @Get('active')
  async findActive(): Promise<CustomerResponseDto[]> {
    return this.customerService.findActive();
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<CustomerResponseDto> {
    return this.customerService.findByEmail(email);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CustomerResponseDto> {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.customerService.remove(id);
  }
}
