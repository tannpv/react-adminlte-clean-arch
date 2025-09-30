import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponseDto, PaginationDto } from '../../../../shared/dto';
import { Carrier } from '../../domain/entities/carrier.entity';
import { CarrierResponseDto } from '../dto/carrier-response.dto';
import { CreateCarrierDto } from '../dto/create-carrier.dto';
import { UpdateCarrierDto } from '../dto/update-carrier.dto';

@Injectable()
export class CarrierService {
  constructor(
    @InjectRepository(Carrier)
    private readonly carrierRepository: Repository<Carrier>,
  ) {}

  async create(createCarrierDto: CreateCarrierDto): Promise<CarrierResponseDto> {
    // Check if carrier with same name already exists
    const existingCarrier = await this.carrierRepository.findOne({
      where: { name: createCarrierDto.name },
    });

    if (existingCarrier) {
      throw new ConflictException('Carrier with this name already exists');
    }

    const carrier = this.carrierRepository.create(createCarrierDto);
    const savedCarrier = await this.carrierRepository.save(carrier);
    
    return new CarrierResponseDto(savedCarrier);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<CarrierResponseDto>> {
    const { page = 1, limit = 10, search, sortBy = 'name', sortOrder = 'ASC' } = paginationDto;
    
    const queryBuilder = this.carrierRepository.createQueryBuilder('carrier');
    
    if (search) {
      queryBuilder.where(
        'carrier.name ILIKE :search OR carrier.description ILIKE :search',
        { search: `%${search}%` }
      );
    }
    
    queryBuilder
      .orderBy(`carrier.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);
    
    const [carriers, total] = await queryBuilder.getManyAndCount();
    
    const carrierResponses = carriers.map(carrier => new CarrierResponseDto(carrier));
    
    return new PaginatedResponseDto(carrierResponses, total, page, limit);
  }

  async findOne(id: number): Promise<CarrierResponseDto> {
    const carrier = await this.carrierRepository.findOne({ where: { id } });
    
    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${id} not found`);
    }
    
    return new CarrierResponseDto(carrier);
  }

  async update(id: number, updateCarrierDto: UpdateCarrierDto): Promise<CarrierResponseDto> {
    const carrier = await this.carrierRepository.findOne({ where: { id } });
    
    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${id} not found`);
    }

    // Check if name is being updated and if it conflicts
    if (updateCarrierDto.name && updateCarrierDto.name !== carrier.name) {
      const existingCarrier = await this.carrierRepository.findOne({
        where: { name: updateCarrierDto.name },
      });

      if (existingCarrier) {
        throw new ConflictException('Carrier with this name already exists');
      }
    }

    Object.assign(carrier, updateCarrierDto);
    const updatedCarrier = await this.carrierRepository.save(carrier);
    
    return new CarrierResponseDto(updatedCarrier);
  }

  async remove(id: number): Promise<void> {
    const carrier = await this.carrierRepository.findOne({ where: { id } });
    
    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${id} not found`);
    }

    await this.carrierRepository.remove(carrier);
  }

  async findActive(): Promise<CarrierResponseDto[]> {
    const carriers = await this.carrierRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
    
    return carriers.map(carrier => new CarrierResponseDto(carrier));
  }
}
