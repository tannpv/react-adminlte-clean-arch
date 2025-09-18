import { ProductRepository } from '../../domain/repositories/product.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { DomainEventBus } from '../../shared/events/domain-event.bus';
import { ProductResponseDto } from '../dto/product-response.dto';
export declare class ProductsService {
    private readonly products;
    private readonly events;
    constructor(products: ProductRepository, events: DomainEventBus);
    list(): Promise<ProductResponseDto[]>;
    findById(id: number): Promise<ProductResponseDto>;
    create(dto: CreateProductDto): Promise<ProductResponseDto>;
    update(id: number, dto: UpdateProductDto): Promise<ProductResponseDto>;
    remove(id: number): Promise<ProductResponseDto>;
    private ensureSkuUnique;
    private toPriceCents;
}
