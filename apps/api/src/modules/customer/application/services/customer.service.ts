import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponseDto, PaginationDto } from '../../../../shared/dto';
import { Customer } from '../../domain/entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CustomerResponseDto } from '../dto/customer-response.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    // Check if customer with same email already exists
    const existingCustomer = await this.customerRepository.findOne({
      where: { email: createCustomerDto.email },
    });

    if (existingCustomer) {
      throw new ConflictException('Customer with this email already exists');
    }

    const customer = this.customerRepository.create(createCustomerDto);
    const savedCustomer = await this.customerRepository.save(customer);
    
    return new CustomerResponseDto(savedCustomer);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<CustomerResponseDto>> {
    const { page = 1, limit = 10, search, sortBy = 'firstName', sortOrder = 'ASC' } = paginationDto;
    
    const queryBuilder = this.customerRepository.createQueryBuilder('customer');
    
    if (search) {
      queryBuilder.where(
        'customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search',
        { search: `%${search}%` }
      );
    }
    
    queryBuilder
      .orderBy(`customer.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);
    
    const [customers, total] = await queryBuilder.getManyAndCount();
    
    const customerResponses = customers.map(customer => new CustomerResponseDto(customer));
    
    return new PaginatedResponseDto(customerResponses, total, page, limit);
  }

  async findOne(id: number): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    
    return new CustomerResponseDto(customer);
  }

  async findByEmail(email: string): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({ where: { email } });
    
    if (!customer) {
      throw new NotFoundException(`Customer with email ${email} not found`);
    }
    
    return new CustomerResponseDto(customer);
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Check if email is being updated and if it conflicts
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { email: updateCustomerDto.email },
      });

      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    Object.assign(customer, updateCustomerDto);
    const updatedCustomer = await this.customerRepository.save(customer);
    
    return new CustomerResponseDto(updatedCustomer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await this.customerRepository.remove(customer);
  }

  async findActive(): Promise<CustomerResponseDto[]> {
    const customers = await this.customerRepository.find({
      where: { isActive: true },
      order: { firstName: 'ASC' },
    });
    
    return customers.map(customer => new CustomerResponseDto(customer));
  }
}
